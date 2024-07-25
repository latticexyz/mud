import path from "node:path";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { tablegen } from "@latticexyz/store/codegen";
import { World } from "../config/v2";
import { worldgen } from "../node";

/**
 * To avoid circular dependencies, we run a very similar `build` step as `cli` package here.
 */

// TODO: turn this into something we can run from CLI, then we can import/use it via CLI and here rather than duplicating.
// TODO: do the same for store build too

const configPath = await resolveConfigPath();
const rootDir = path.dirname(configPath);
const config = (await loadConfig(configPath)) as World;

await Promise.all([
  tablegen({ rootDir, config }),
  worldgen({
    rootDir,
    config: {
      ...config,
      // override the namespace to be the root namespace for generating the core system interface
      namespace: "",
    },
  }),
]);
