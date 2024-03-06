import type { CommandModule } from "yargs";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";

import { getSrcDirectory } from "@latticexyz/common/foundry";
import { build } from "../build";

type Options = {
  configPath?: string;
  profile?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "build",

  describe: "Build contracts and generate MUD artifacts (table libraries, world interface, ABI)",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
      profile: { type: "string", desc: "The foundry profile to use" },
    });
  },

  async handler({ configPath, profile }) {
    const config = (await loadConfig(configPath)) as StoreConfig & WorldConfig;
    const srcDir = await getSrcDirectory();

    await build({ config, srcDir, foundryProfile: profile });

    process.exit(0);
  },
};

export default commandModule;
