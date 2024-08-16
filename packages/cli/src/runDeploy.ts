import path from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { InferredOptionTypes, Options } from "yargs";
import { deploy } from "./deploy/deploy";
import { createWalletClient, http, Hex, isHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { World as WorldConfig } from "@latticexyz/world";
import { getOutDirectory, getRpcUrl } from "@latticexyz/common/foundry";
import chalk from "chalk";
import { MUDError } from "@latticexyz/common/errors";
import { resolveConfig } from "./deploy/resolveConfig";
import { getChainId } from "viem/actions";
import { postDeploy } from "./utils/postDeploy";
import { WorldDeploy } from "./deploy/common";
import { build } from "./build";
import { kmsKeyToAccount } from "@latticexyz/common/kms";
import { configToModules } from "./deploy/configToModules";
import { nonceManager } from "@latticexyz/common";

export const deployOptions = {
  configPath: { type: "string", desc: "Path to the MUD config file" },
  printConfig: { type: "boolean", desc: "Print the resolved config" },
  profile: { type: "string", desc: "The foundry profile to use" },
  saveDeployment: { type: "boolean", desc: "Save the deployment info to a file", default: true },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  rpcBatch: {
    type: "boolean",
    desc: "Enable batch processing of RPC requests in viem client (defaults to batch size of 100 and wait of 1s)",
  },
  deployerAddress: {
    type: "string",
    desc: "Deploy using an existing deterministic deployer (https://github.com/Arachnid/deterministic-deployment-proxy)",
  },
  worldAddress: { type: "string", desc: "Deploy to an existing World at the given address" },
  skipBuild: { type: "boolean", desc: "Skip rebuilding the contracts before deploying" },
  alwaysRunPostDeploy: {
    type: "boolean",
    desc: "Always run PostDeploy.s.sol after each deploy (including during upgrades). By default, PostDeploy.s.sol is only run once after a new world is deployed.",
  },
  forgeScriptOptions: { type: "string", description: "Options to pass to forge script PostDeploy.s.sol" },
  salt: {
    type: "string",
    desc: "The deployment salt to use. Defaults to a random salt.",
  },
  kms: {
    type: "boolean",
    desc: "Deploy the World with an AWS KMS key instead of local private key.",
  },
} as const satisfies Record<string, Options>;

export type DeployOptions = InferredOptionTypes<typeof deployOptions>;

/**
 * Given some CLI arguments, finds and resolves a MUD config, foundry profile, and runs a deploy.
 * This is used by the deploy, test, and dev-contracts CLI commands.
 */
export async function runDeploy(opts: DeployOptions): Promise<WorldDeploy> {
  const salt = opts.salt;
  if (salt != null && !isHex(salt)) {
    throw new MUDError("Expected hex string for salt");
  }

  const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

  const configPath = await resolveConfigPath(opts.configPath);
  const config = (await loadConfig(configPath)) as WorldConfig;
  const rootDir = path.dirname(configPath);

  if (opts.printConfig) {
    console.log(chalk.green("\nResolved config:\n"), JSON.stringify(config, null, 2));
  }

  const outDir = await getOutDirectory(profile);

  const rpc = opts.rpc ?? (await getRpcUrl(profile));
  console.log(
    chalk.bgBlue(
      chalk.whiteBright(`\n Deploying MUD contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`),
    ),
  );

  // Run build
  if (!opts.skipBuild) {
    await build({ rootDir, config, foundryProfile: profile });
  }

  const { systems, libraries } = await resolveConfig({
    rootDir,
    config,
    forgeOutDir: outDir,
  });
  const modules = await configToModules(config, outDir);

  const account = await (async () => {
    if (opts.kms) {
      const keyId = process.env.AWS_KMS_KEY_ID;
      if (!keyId) {
        throw new MUDError(
          "Missing `AWS_KMS_KEY_ID` environment variable. This is required when using with `--kms` option.",
        );
      }

      return await kmsKeyToAccount({ keyId });
    } else {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new MUDError(
          `Missing PRIVATE_KEY environment variable.
  Run 'echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env'
  in your contracts directory to use the default anvil private key.`,
        );
      }

      return privateKeyToAccount(privateKey as Hex, { nonceManager });
    }
  })();

  const client = createWalletClient({
    transport: http(rpc, {
      batch: opts.rpcBatch
        ? {
            batchSize: 100,
            wait: 1000,
          }
        : undefined,
    }),
    account,
  });

  console.log("Deploying from", client.account.address);

  const tables = Object.values(config.namespaces)
    .flatMap((namespace) => Object.values(namespace.tables))
    .filter((table) => !table.deploy.disabled);

  const startTime = Date.now();
  const worldDeploy = await deploy({
    deployerAddress: opts.deployerAddress as Hex | undefined,
    salt,
    worldAddress: opts.worldAddress as Hex | undefined,
    client,
    tables,
    systems,
    libraries,
    modules,
    withWorldProxy: config.deploy.upgradeableWorldImplementation,
  });
  if (opts.worldAddress == null || opts.alwaysRunPostDeploy) {
    await postDeploy(
      config.deploy.postDeployScript,
      worldDeploy.address,
      rpc,
      profile,
      opts.forgeScriptOptions,
      opts.kms ? true : false,
    );
  }
  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

  const deploymentInfo = {
    worldAddress: worldDeploy.address,
    blockNumber: Number(worldDeploy.deployBlock),
  };

  if (opts.saveDeployment) {
    const chainId = await getChainId(client);
    const deploysDir = path.join(config.deploy.deploysDirectory, chainId.toString());
    mkdirSync(deploysDir, { recursive: true });
    writeFileSync(path.join(deploysDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));
    writeFileSync(path.join(deploysDir, Date.now() + ".json"), JSON.stringify(deploymentInfo, null, 2));

    const localChains = [1337, 31337];
    const deploys = existsSync(config.deploy.worldsFile)
      ? JSON.parse(readFileSync(config.deploy.worldsFile, "utf-8"))
      : {};
    deploys[chainId] = {
      address: deploymentInfo.worldAddress,
      // We expect the worlds file to be committed and since local deployments are often
      // a consistent address but different block number, we'll ignore the block number.
      blockNumber: localChains.includes(chainId) ? undefined : deploymentInfo.blockNumber,
    };
    writeFileSync(config.deploy.worldsFile, JSON.stringify(deploys, null, 2));

    console.log(
      chalk.bgGreen(
        chalk.whiteBright(`\n Deployment result (written to ${config.deploy.worldsFile} and ${deploysDir}): \n`),
      ),
    );
  }

  console.log(deploymentInfo);

  return worldDeploy;
}
