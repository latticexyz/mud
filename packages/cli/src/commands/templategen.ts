import path from "path";
import type { CommandModule } from "yargs";
import { loadConfig } from "@latticexyz/config/node";
import { loadTemplateConfig } from "@latticexyz/config";
import { StoreConfig, templategen } from "@latticexyz/store";
import { getSrcDirectory } from "@latticexyz/common/foundry";

type Options = {
  configPath?: string;
  templatePath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "templategen",

  describe: "Autogenerate MUD Store template libraries based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
      templatePath: { type: "string", desc: "Path to the template config file" },
    });
  },

  async handler({ configPath, templatePath }) {
    const config = (await loadConfig(configPath)) as StoreConfig;
    const templateConfig = (await loadTemplateConfig(templatePath)) as Record<string, object>;
    const srcDir = await getSrcDirectory();

    await templategen(config, templateConfig, path.join(srcDir, config.codegenDirectory));

    process.exit(0);
  },
};

export default commandModule;
