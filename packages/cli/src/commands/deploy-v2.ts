import chalk from "chalk";
import { ethers } from "ethers";
import { execa } from "execa";
import glob from "glob";
import { basename } from "path";
import type { CommandModule } from "yargs";
import { loadWorldConfig } from "../config/loadWorldConfig.js";
import { deploy } from "../utils/deploy-v2.js";
import { getOutDirectory } from "../utils/forgeConfig.js";

type Options = {
  configPath?: string;
  printConfig?: boolean;
};

const commandModule: CommandModule<Options, Options> = {
  command: "deploy-v2",

  describe: "Deploy MUD v2 contracts",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
      printConfig: { type: "boolean", desc: "Print the resolved config" },
    });
  },

  async handler({ configPath, printConfig }) {
    // Run forge build
    try {
      await execa("forge", ["build"], { stdout: "inherit", stderr: "pipe" });
    } catch (error: any) {
      if (error?.stderr) {
        console.error(error.stderr);
      }
      console.error(chalk.red("Error running `forge build`"));
      process.exit(1);
    }

    // Get a list of all contract names
    const outDir = await getOutDirectory();
    const existingContracts = glob
      .sync(`${outDir}/*.sol`)
      // Get the basename of the file
      .map((path) => basename(path, ".sol"));

    // Load and resolve the world config
    const config = await loadWorldConfig(configPath, existingContracts);

    if (printConfig) console.log(chalk.green("\nResolved config:\n"), JSON.stringify(config, null, 2));

    deploy(config);
    process.exit(0);
  },
};

export default commandModule;
