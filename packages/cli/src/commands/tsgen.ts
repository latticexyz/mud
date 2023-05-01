import type { CommandModule } from "yargs";
import { loadConfig, MUDCoreConfig } from "@latticexyz/config";
import { tsgen } from "../render-ts/tsgen.js";

type Options = {
  configPath: string;
  out: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "tsgen",

  describe: "Autogenerate MUD typescript definitions based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", demandOption: true, desc: "Path to the config file" },
      out: { type: "string", demandOption: true, desc: "Directory to output MUD typescript definition files" },
    });
  },

  async handler(args) {
    const { configPath, out } = args;

    const config = (await loadConfig(configPath)) as MUDCoreConfig;

    await tsgen(config, out);

    process.exit(0);
  },
};

export default commandModule;
