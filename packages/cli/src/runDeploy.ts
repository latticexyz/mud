import path from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { InferredOptionTypes, Options } from "yargs";
import { deploy } from "./deploy/deploy";
import { createWalletClient, http, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";
import { forge, getOutDirectory, getRemappings, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import chalk from "chalk";
import { execa } from "execa";
import { MUDError } from "@latticexyz/common/errors";
import { resolveConfig } from "./deploy/resolveConfig";
import { getChainId } from "viem/actions";
import { postDeploy } from "./utils/utils/postDeploy";
import { WorldDeploy } from "./deploy/common";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";
import { getExistingContracts } from "./utils/getExistingContracts";

export const deployOptions = {
  configPath: { type: "string", desc: "Path to the config file" },
  printConfig: { type: "boolean", desc: "Print the resolved config" },
  profile: { type: "string", desc: "The foundry profile to use" },
  saveDeployment: { type: "boolean", desc: "Save the deployment info to a file", default: true },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  worldAddress: { type: "string", desc: "Deploy to an existing World at the given address" },
  srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
  skipBuild: { type: "boolean", desc: "Skip rebuilding the contracts before deploying" },
  alwaysRunPostDeploy: {
    type: "boolean",
    desc: "Always run PostDeploy.s.sol after each deploy (including during upgrades). By default, PostDeploy.s.sol is only run once after a new world is deployed.",
  },
} as const satisfies Record<string, Options>;

export type DeployOptions = InferredOptionTypes<typeof deployOptions>;

/**
 * Given some CLI arguments, finds and resolves a MUD config, foundry profile, and runs a deploy.
 * This is used by the deploy, test, and dev-contracts CLI commands.
 */
export async function runDeploy(opts: DeployOptions): Promise<WorldDeploy> {
  const profile = opts.profile ?? process.env.FOUNDRY_PROFILE;

  const config = (await loadConfig(opts.configPath)) as StoreConfig & WorldConfig;
  if (opts.printConfig) {
    console.log(chalk.green("\nResolved config:\n"), JSON.stringify(config, null, 2));
  }

  const srcDir = opts.srcDir ?? (await getSrcDirectory(profile));
  const outDir = await getOutDirectory(profile);
  const remappings = await getRemappings();

  const rpc = opts.rpc ?? (await getRpcUrl(profile));
  console.log(
    chalk.bgBlue(
      chalk.whiteBright(`\n Deploying MUD contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`)
    )
  );

  // Run build
  if (!opts.skipBuild) {
    const outPath = path.join(srcDir, config.codegenDirectory);
    await Promise.all([tablegen(config, outPath, remappings), worldgen(config, getExistingContracts(srcDir), outPath)]);
    await forge(["build"], { profile });
    await execa("mud", ["abi-ts"], { stdio: "inherit" });
  }

  const privateKey = process.env.PRIVATE_KEY as Hex;
  if (!privateKey) {
    throw new MUDError(
      `Missing PRIVATE_KEY environment variable.
Run 'echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env'
in your contracts directory to use the default anvil private key.`
    );
  }

  const resolvedConfig = resolveConfig({ config, forgeSourceDir: srcDir, forgeOutDir: outDir });

  const client = createWalletClient({
    transport: http(rpc),
    account: privateKeyToAccount(privateKey),
  });
  console.log("Deploying from", client.account.address);

  const startTime = Date.now();
  const worldDeploy = await deploy({
    worldAddress: opts.worldAddress as Hex | undefined,
    client,
    config: resolvedConfig,
  });
  if (opts.worldAddress == null || opts.alwaysRunPostDeploy) {
    await postDeploy(config.postDeployScript, worldDeploy.address, rpc, profile);
  }
  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

  const deploymentInfo = {
    worldAddress: worldDeploy.address,
    blockNumber: Number(worldDeploy.deployBlock),
  };

  if (opts.saveDeployment) {
    const chainId = await getChainId(client);
    const deploysDir = path.join(config.deploysDirectory, chainId.toString());
    mkdirSync(deploysDir, { recursive: true });
    writeFileSync(path.join(deploysDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));
    writeFileSync(path.join(deploysDir, Date.now() + ".json"), JSON.stringify(deploymentInfo, null, 2));

    const localChains = [1337, 31337];
    const deploys = existsSync(config.worldsFile) ? JSON.parse(readFileSync(config.worldsFile, "utf-8")) : {};
    deploys[chainId] = {
      address: deploymentInfo.worldAddress,
      // We expect the worlds file to be committed and since local deployments are often
      // a consistent address but different block number, we'll ignore the block number.
      blockNumber: localChains.includes(chainId) ? undefined : deploymentInfo.blockNumber,
    };
    writeFileSync(config.worldsFile, JSON.stringify(deploys, null, 2));

    console.log(
      chalk.bgGreen(chalk.whiteBright(`\n Deployment result (written to ${config.worldsFile} and ${deploysDir}): \n`))
    );
  }

  console.log(deploymentInfo);

  return worldDeploy;
}
