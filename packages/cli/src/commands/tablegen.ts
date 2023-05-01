import path from "path";
import type { CommandModule } from "yargs";
import { loadConfig, MUDCoreConfig } from "@latticexyz/config";
import { tablegen } from "@latticexyz/store";
import { getSrcDirectory } from "@latticexyz/common/foundry";

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
    const config = (await loadConfig(configPath)) as MUDCoreConfig;
    const srcDir = await getSrcDirectory();

    await tablegen(config, path.join(srcDir, config.codegenDirectory));

    process.exit(0);
  },
};

export default commandModule;
