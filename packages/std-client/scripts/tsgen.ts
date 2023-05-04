import { tsgen } from "@latticexyz/cli";

import storeMudConfig from "@latticexyz/store/mud.config.js";
import worldMudConfig from "@latticexyz/world/mud.config.js";

await tsgen(storeMudConfig, "src/mud-definitions/store");
await tsgen(worldMudConfig, "src/mud-definitions/world");
