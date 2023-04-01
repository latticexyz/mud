import type { CommandModule } from "yargs";
import { loadStoreConfig } from "../config/loadStoreConfig.js";
import { getSrcDirectory } from "../utils/foundry.js";
import { tablegen } from "../render-solidity/tablegen.js";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "tablegen",

  describe: "Autogenerate MUD Store table libraries based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    const srcDirectory = await getSrcDirectory();

    const config = await loadStoreConfig(configPath);

    await tablegen(config, srcDirectory);

    process.exit(0);
  },
};

export default commandModule;
