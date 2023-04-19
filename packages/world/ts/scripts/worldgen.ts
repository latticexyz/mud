import glob from "glob";
import path, { basename } from "path";
import { rmSync } from "fs";
import { loadStoreConfig, loadWorldConfig } from "@latticexyz/config";
import { worldgen } from "../render-solidity/worldgen";

// TODO dedupe this and cli's worldgen command
const configPath = undefined;
const clean = false;
// TODO extract `foundry.ts` from the cli package and use its `getSrcDirectory` here
const srcDir = "./src";

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

const outputBaseDirectory = path.join(srcDir, mudConfig.codegenDirectory);

// clear the worldgen directory
if (clean) rmSync(path.join(outputBaseDirectory, mudConfig.worldgenDirectory), { recursive: true, force: true });

// generate new interfaces
await worldgen(mudConfig, existingContracts, outputBaseDirectory);

process.exit(0);
