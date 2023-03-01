import chalk from "chalk";
import { ethers } from "ethers";
import { execa } from "execa";
import glob from "glob";
import { basename } from "path";
import type { CommandModule } from "yargs";
import { loadWorldConfig } from "../config/loadWorldConfig.js";
import { deploy } from "../utils/deploy-v2.js";
import { logError } from "../utils/errors.js";
import { forge } from "../utils/foundry.js";
import { getOutDirectory } from "../utils/forgeConfig.js";

type Options = {
  configPath?: string;
  printConfig?: boolean;
  rpc: string;
  privateKey: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "deploy-v2",

  describe: "Deploy MUD v2 contracts",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
      printConfig: { type: "boolean", desc: "Print the resolved config" },
      rpc: { type: "string", desc: "RPC endpoint to deploy to", default: "http://localhost:8545" },
      privateKey: {
        type: "string",
        desc: "Private key of the deployer account",
        default: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Anvil default private key
      },
    });
  },

  async handler(args) {
    const { configPath, printConfig } = args;
    // Run forge build
    await forge("build");

    // Get a list of all contract names
    const outDir = await getOutDirectory();
    const existingContracts = glob
      .sync(`${outDir}/*.sol`)
      // Get the basename of the file
      .map((path) => basename(path, ".sol"));

    // Load and resolve the world config
    const config = await loadWorldConfig(configPath, existingContracts);

    if (printConfig) console.log(chalk.green("\nResolved config:\n"), JSON.stringify(config, null, 2));

    try {
      await deploy(config, args);
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }

    process.exit(0);
  },
};

export default commandModule;
