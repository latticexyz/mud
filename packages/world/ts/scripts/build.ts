import path from "node:path";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { getRemappings } from "@latticexyz/common/foundry";
import { tablegen } from "@latticexyz/store/codegen";
import { getContracts } from "../node/getContracts";
import { World } from "../config/v2";
import { generateSystemManifest, worldgen } from "../node";

/**
 * To avoid circular dependencies, we run a very similar `build` step as `cli` package here.
 */

// TODO: turn this into something we can run from CLI, then we can import/use it via CLI and here rather than duplicating.
// TODO: do the same for store build too

const configPath = await resolveConfigPath();
const config = (await loadConfig(configPath)) as World;
const remappings = await getRemappings();

// TODO: move this into worldgen
const existingContracts = (await getContracts({ configPath, config })).map((contract) => ({
  path: contract.source,
  basename: contract.name,
}));
const codegenDirectory = path.join(config.sourceDirectory, config.codegen.outputDirectory);

// TODO: clean

await Promise.all([
  tablegen({ configPath, config, remappings }),
  worldgen(
    {
      ...config,
      // override the namespace to be the root namespace for generating the core system interface
      namespace: "",
    },
    existingContracts,
    codegenDirectory,
  ),
  generateSystemManifest({ configPath, config }),
]);
