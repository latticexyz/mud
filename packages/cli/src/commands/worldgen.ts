import type { CommandModule } from "yargs";
import { loadStoreConfig } from "../config/loadStoreConfig.js";
import { loadWorldConfig } from "../config/index.js";
import { getSrcDirectory } from "../utils/foundry.js";
import glob from "glob";
import path, { basename } from "node:path";
import { worldgen } from "../render-solidity/worldgen.js";
import { rmSync } from "fs";

type Options = {
  configPath?: string;
  clean?: boolean;
};

const commandModule: CommandModule<Options, Options> = {
  command: "worldgen",

  describe: "Autogenerate interfaces for Systems and World based on existing contracts and the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
      clean: { type: "boolean", desc: "Clear the worldgen directory before generating new interfaces" },
    });
  },

  async handler(args) {
    const { configPath, clean } = args;
    const srcDir = await getSrcDirectory();

    // Get a list of all contract names
    const existingContracts = glob.sync(`${srcDir}/**/*.sol`).map((path) => ({
      path,
      basename: basename(path, ".sol"),
    }));

    // Load and resolve the config
    const worldConfig = await loadWorldConfig(
      configPath,
      existingContracts.map(({ basename }) => basename)
    );
    const storeConfig = await loadStoreConfig(configPath);
    const mudConfig = { ...worldConfig, ...storeConfig };

    // clear the worldgen directory
    if (clean) rmSync(path.join(srcDir, worldConfig.worldgenDirectory), { recursive: true, force: true });

    // generate new interfaces
    await worldgen(mudConfig, existingContracts, srcDir);

    process.exit(0);
  },
};

export default commandModule;
