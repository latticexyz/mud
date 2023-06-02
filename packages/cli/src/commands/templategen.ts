import path from "path";
import type { CommandModule } from "yargs";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig, Templates, templategen } from "@latticexyz/store";
import { getSrcDirectory } from "@latticexyz/common/foundry";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "templategen",

  describe: "Autogenerate MUD Store template libraries based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    const config = (await loadConfig(configPath)) as StoreConfig & { templates: Templates<StoreConfig> };
    const srcDir = await getSrcDirectory();

    await templategen(config, path.join(srcDir, config.codegenDirectory));

    process.exit(0);
  },
};

export default commandModule;
