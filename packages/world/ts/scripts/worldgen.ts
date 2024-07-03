import { globSync } from "glob";
import path from "node:path";
import { rmSync } from "node:fs";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { getSrcDirectory } from "@latticexyz/common/foundry";
import { worldgen } from "../node";
import { World as WorldConfig } from "../config/v2/output";

// TODO dedupe this and cli's worldgen command
const clean = false;
const srcDir = await getSrcDirectory();

// Get a list of all contract names
const existingContracts = globSync(`${srcDir}/**/*.sol`).map((filename) => ({
  path: filename,
  basename: path.basename(filename, ".sol"),
}));

// Load and resolve the config
const configPath = await resolveConfigPath();
const config = (await loadConfig(configPath)) as WorldConfig;

const outputBaseDirectory = path.join(srcDir, config.codegen.outputDirectory);

// clear the worldgen directory
if (clean) {
  rmSync(path.join(outputBaseDirectory, config.codegen.worldgenDirectory), { recursive: true, force: true });
}

// generate new interfaces
await worldgen({
  config: {
    ...config,
    // override the namespace to be the root namespace for generating the core system interface
    namespace: "",
  },
  configPath,
  existingContracts,
  outputBaseDirectory,
});
