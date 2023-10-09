import type { CommandModule, InferredOptionTypes, Options } from "yargs";
import { logError } from "../utils/errors";
import { deploy } from "../deploy/deploy";
import { createWalletClient, http, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";
import { forge, getOutDirectory, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import chalk from "chalk";
import { execa } from "execa";
import { MUDError } from "@latticexyz/common/errors";
import { resolveConfig } from "../deploy/resolveConfig";
import { getChainId } from "viem/actions";
import path from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { postDeploy } from "../utils/utils/postDeploy";

export const opts = {
  configPath: { type: "string", desc: "Path to the config file" },
  clean: { type: "boolean", desc: "Remove the build forge artifacts and cache directories before building" },
  printConfig: { type: "boolean", desc: "Print the resolved config" },
  profile: { type: "string", desc: "The foundry profile to use" },
  saveDeployment: { type: "boolean", desc: "Save the deployment info to a file", default: true },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  worldAddress: { type: "string", desc: "Deploy to an existing World at the given address" },
  srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
  skipBuild: { type: "boolean", desc: "Skip rebuilding the contracts before deploying" },
} as const satisfies Record<string, Options>;

const commandModule: CommandModule<typeof opts, InferredOptionTypes<typeof opts>> = {
  command: "deploy",

  describe: "Deploy MUD contracts",

  builder(yargs) {
    return yargs.options(opts);
  },

  async handler(args) {
    // Wrap in try/catch, because yargs seems to swallow errors
    try {
      const { configPath, printConfig, clean, skipBuild } = args;
      const profile = args.profile ?? process.env.FOUNDRY_PROFILE;

      const rpc = args.rpc ?? (await getRpcUrl(profile));
      console.log(
        chalk.bgBlue(
          chalk.whiteBright(`\n Deploying MUD contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`)
        )
      );

      if (clean) {
        await forge(["clean"], { profile });
      }

      // Run forge build
      if (!skipBuild) {
        await forge(["build", "--skip", "test", "script"], { profile });
        await execa("mud", ["abi-ts"], { stdio: "inherit" });
      }

      const srcDir = args.srcDir ?? (await getSrcDirectory(profile));
      const outDir = await getOutDirectory(profile);

      const config = (await loadConfig(configPath)) as StoreConfig & WorldConfig;
      if (printConfig) console.log(chalk.green("\nResolved config:\n"), JSON.stringify(config, null, 2));

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
        worldAddress: args.worldAddress as Hex | undefined,
        client,
        config: resolvedConfig,
      });
      await postDeploy(config.postDeployScript, worldDeploy.address, rpc, profile);
      console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

      if (args.saveDeployment) {
        const deploymentInfo = {
          worldAddress: worldDeploy.address,
          blockNumber: Number(worldDeploy.fromBlock),
        };
        const chainId = await getChainId(client);
        const deploysDir = path.join(config.deploysDirectory, chainId.toString());
        mkdirSync(deploysDir, { recursive: true });
        writeFileSync(path.join(deploysDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));
        writeFileSync(path.join(deploysDir, Date.now() + ".json"), JSON.stringify(deploymentInfo, null, 2));

        const localChains = [1337, 31337];
        const deploys = existsSync(config.worldsFile) ? JSON.parse(readFileSync(config.worldsFile, "utf-8")) : {};
        deploys[chainId] = {
          address: deploymentInfo.worldAddress,
          // We expect the worlds file to be committed and since local deployments are often a consistent address but different block number, we'll ignore the block number.
          blockNumber: localChains.includes(chainId) ? undefined : deploymentInfo.blockNumber,
        };
        writeFileSync(config.worldsFile, JSON.stringify(deploys, null, 2));

        console.log(
          chalk.bgGreen(
            chalk.whiteBright(`\n Deployment result (written to ${config.worldsFile} and ${deploysDir}): \n`)
          )
        );
      }
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
