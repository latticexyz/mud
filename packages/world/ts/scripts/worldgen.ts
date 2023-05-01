import glob from "glob";
import path, { basename } from "path";
import { rmSync } from "fs";
import { loadConfig, MUDCoreConfig } from "@latticexyz/config";
import { worldgen } from "../render-solidity/worldgen";
import { getSrcDirectory } from "@latticexyz/common/foundry";

// TODO dedupe this and cli's worldgen command
const configPath = undefined;
const clean = false;
const srcDir = await getSrcDirectory();

// Get a list of all contract names
const existingContracts = glob.sync(`${srcDir}/**/*.sol`).map((path) => ({
  path,
  basename: basename(path, ".sol"),
}));

// Load and resolve the config
const mudConfig = (await loadConfig(configPath)) as MUDCoreConfig;

const outputBaseDirectory = path.join(srcDir, mudConfig.codegenDirectory);

// clear the worldgen directory
if (clean) rmSync(path.join(outputBaseDirectory, mudConfig.worldgenDirectory), { recursive: true, force: true });

// generate new interfaces
await worldgen(mudConfig, existingContracts, outputBaseDirectory);
