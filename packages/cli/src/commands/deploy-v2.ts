import type { CommandModule } from "yargs";
import { getSrcDirectory } from "../utils/forgeConfig.js";
import { loadWorldConfig } from "../config/loadWorldConfig.js";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "deploy-v2",

  describe: "Deploy MUD v2 contracts",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    // const srcDir = await getSrcDirectory();

    const config = await loadWorldConfig(configPath);

    console.log("Loaded config", config);

    process.exit(0);
  },
};

export default commandModule;
