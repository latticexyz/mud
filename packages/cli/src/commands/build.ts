import type { CommandModule } from "yargs";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { World as WorldConfig } from "@latticexyz/world";
import { build } from "../build";
import path from "node:path";

type Options = {
  configPath?: string;
  profile?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "build",

  describe: "Build contracts and generate MUD artifacts (table libraries, world interface, ABI)",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the MUD config file" },
      profile: { type: "string", desc: "The foundry profile to use" },
    });
  },

  async handler(opts) {
    const configPath = await resolveConfigPath(opts.configPath);
    const config = (await loadConfig(configPath)) as WorldConfig;

    await build({ rootDir: path.dirname(configPath), config, foundryProfile: opts.profile });

    process.exit(0);
  },
};

export default commandModule;
