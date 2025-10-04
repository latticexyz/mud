import path from "node:path";
import { fileURLToPath } from "node:url";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";

/**
 * To avoid circular dependencies, we run a very similar `build` step as `cli` package here.
 */

// TODO: move tablegen/worldgen to CLI commands from store/world we can run in package.json instead of a custom script
//       (https://github.com/latticexyz/mud/issues/3030)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = "../mud.config";

const { default: config } = await import(configPath);
const rootDir = path.dirname(path.join(__dirname, configPath));

await tablegen({ rootDir, config });
await worldgen({ rootDir, config });
