import path from "node:path";
import { resolveConfigPath } from "@latticexyz/config/node";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "../node";
import config, { systemsConfig } from "../../mud.config";

/**
 * To avoid circular dependencies, we run a very similar `build` step as `cli` package here.
 */

// TODO: turn this into something we can run from CLI, then we can import/use it via CLI and here rather than duplicating.
// TODO: do the same for store build too

const configPath = await resolveConfigPath();
const rootDir = path.dirname(configPath);

await tablegen({ rootDir, config });
// until we get finer-grained control of for namespaces (source path, codegen)
// or being able to merge configs with strong types, we need to use a separate
// config for systems to maintain source locations
await worldgen({ rootDir, config: systemsConfig });
