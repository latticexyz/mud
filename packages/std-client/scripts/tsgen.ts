import { tsgen } from "@latticexyz/cli";

import storeMudConfig from "@latticexyz/store/.mud/expandedConfig";
import worldMudConfig from "@latticexyz/world/.mud/expandedConfig";

await tsgen(storeMudConfig, "src/mud-definitions/store");
await tsgen(worldMudConfig, "src/mud-definitions/world");
