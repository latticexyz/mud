import type { CommandModule } from "yargs";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { Store as StoreConfig } from "@latticexyz/store";
import { tablegen } from "@latticexyz/store/codegen";
import { getRemappings } from "@latticexyz/common/foundry";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "tablegen",

  describe: "Autogenerate MUD Store table libraries based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the MUD config file" },
    });
  },

  async handler(opts) {
    const configPath = await resolveConfigPath(opts.configPath);
    const config = (await loadConfig(configPath)) as StoreConfig;
    const remappings = await getRemappings();

    await tablegen({ configPath, config, remappings });

    process.exit(0);
  },
};

export default commandModule;
