import path from "path";
import type { CommandModule } from "yargs";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { tablegen } from "@latticexyz/store/codegen";
import { getRemappings, getSrcDirectory } from "@latticexyz/common/foundry";

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
    const config = (await loadConfig(configPath)) as StoreConfig;
    const srcDir = await getSrcDirectory();
    const remappings = await getRemappings();

    await tablegen(config, path.join(srcDir, config.codegenDirectory), remappings);

    process.exit(0);
  },
};

export default commandModule;
