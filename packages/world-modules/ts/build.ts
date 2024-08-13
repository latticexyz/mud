import path from "node:path";
import { fileURLToPath } from "node:url";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";

/**
 * To avoid circular dependencies, we run a very similar `build` step as `cli` package here.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configPaths = ["../mud.config", "../src/modules/metadata/mud.config"];

await Promise.all(
  configPaths.map(async (configPath) => {
    const { default: config } = await import(configPath);
    const rootDir = path.dirname(path.join(__dirname, configPath));
    await Promise.all([tablegen({ rootDir, config }), worldgen({ rootDir, config })]);
  }),
);
