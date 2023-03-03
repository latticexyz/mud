import chalk from "chalk";
import glob from "glob";
import { basename } from "path";
import type { CommandModule } from "yargs";
import { loadWorldConfig } from "../config/loadWorldConfig.js";
import { deploy } from "../utils/deploy-v2.js";
import { logError, MUDError } from "../utils/errors.js";
import { forge, getRpcUrl } from "../utils/foundry.js";
import { getOutDirectory } from "../utils/foundry.js";
import { loadStoreConfig } from "../index.js";

type Options = {
  configPath?: string;
  printConfig?: boolean;
  profile?: string;
  privateKey: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "deploy-v2",

  describe: "Deploy MUD v2 contracts",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
      printConfig: { type: "boolean", desc: "Print the resolved config" },
      profile: { type: "string", desc: "The foundry profile to use" },
    });
  },

  async handler(args) {
    const { configPath, printConfig, profile } = args;

    const rpc = await getRpcUrl(profile);
    console.log(
      chalk.bgBlue(
        chalk.whiteBright(`\n Deploying MUD v2 contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`)
      )
    );

    // Run forge build
    await forge(["build"], { profile });

    // Get a list of all contract names
    const outDir = await getOutDirectory();
    const existingContracts = glob
      .sync(`${outDir}/*.sol`)
      // Get the basename of the file
      .map((path) => basename(path, ".sol"));

    // Load and resolve the config
    const worldConfig = await loadWorldConfig(configPath, existingContracts);
    const storeConfig = await loadStoreConfig(configPath);
    const mudConfig = { ...worldConfig, ...storeConfig };

    if (printConfig) console.log(chalk.green("\nResolved config:\n"), JSON.stringify(mudConfig, null, 2));

    try {
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) throw new MUDError("Missing PRIVATE_KEY environment variable");
      await deploy(mudConfig, { ...args, rpc, privateKey });
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }

    process.exit(0);
  },
};

export default commandModule;
