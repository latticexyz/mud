import type { CommandModule } from "yargs";
import {
  anvil,
  forge,
  getRemappings,
  getRpcUrl,
  getScriptDirectory,
  getSrcDirectory,
} from "@latticexyz/common/foundry";
import chalk from "chalk";
import { execa } from "execa";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";

type Options = {
  rpc?: string;
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "zk",

  describe: "zk script",

  builder(yargs) {
    return yargs
      .options({
        upper: { type: "boolean" },
      })
      .positional("name", { type: "string", demandOption: true });
  },

  async handler(args) {
    console.log(chalk.blue("Building with zk"));

    const srcDirectory = await getSrcDirectory();
    const scriptDirectory = await getScriptDirectory();
    const remappings = await getRemappings();

    // console log the variables
    console.log(chalk.blue("srcDirectory: ", srcDirectory));
    console.log(chalk.blue("scriptDirectory: ", scriptDirectory));
    console.log(chalk.blue("remappings: ", remappings));

    try {
      // Build with zk
      //navigate to the contracts folder
      process.chdir("packages/contracts");
      await execa("zkforge", ["zkbuild"], { stdio: "inherit" });

      console.log(chalk.green("zkbuild completed successfully!"));
    } catch (error) {
      console.error(chalk.red("zkbuild failed."));
      console.error(error);
    }

    process.exit(0);
  },
};

export default commandModule;
