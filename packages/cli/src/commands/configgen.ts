import path from "path";
import type { CommandModule } from "yargs";
import { loadConfig } from "@latticexyz/config";
import { StoreConfig, configgen } from "@latticexyz/store";
import { getSrcDirectory } from "@latticexyz/common/foundry";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "configgen",

  describe: "Autogenerate MUD Store template types based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    const config = (await loadConfig(configPath)) as StoreConfig;
    const srcDir = await getSrcDirectory();

    await configgen(config, path.join(srcDir, config.codegenDirectory));

    process.exit(0);
  },
};

export default commandModule;
