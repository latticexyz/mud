import { parseStoreConfig } from "@latticexyz/config";
import { tsgen } from "@latticexyz/cli";

import storeMudConfig from "@latticexyz/store/mud.config.js";
import worldMudConfig from "@latticexyz/world/mud.config.js";

await tsgen(parseStoreConfig(storeMudConfig), "src/mud-definitions/store");
await tsgen(parseStoreConfig(worldMudConfig), "src/mud-definitions/world");
