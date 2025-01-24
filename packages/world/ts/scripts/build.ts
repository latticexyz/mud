import path from "node:path";
import { resolveConfigPath } from "@latticexyz/config/node";
import { tablegen } from "@latticexyz/store/codegen";
import { defineWorld } from "../config/v2/world";
import { worldgen } from "../node";
import config, { configInput } from "../../mud.config";

/**
 * To avoid circular dependencies, we run a very similar `build` step as `cli` package here.
 */

// TODO: turn this into something we can run from CLI, then we can import/use it via CLI and here rather than duplicating.
// TODO: do the same for store build too

const configPath = await resolveConfigPath();
const rootDir = path.dirname(configPath);

await Promise.all([
  tablegen({ rootDir, config }),
  worldgen({
    rootDir,
    // use root namespace to generate the core system interfaces
    config: defineWorld({ ...configInput, namespace: "" }),
  }),
]);
