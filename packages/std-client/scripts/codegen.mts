import { parseStoreConfig } from "@latticexyz/cli";
import { tsgen } from "@latticexyz/cli/dist/render-ts";

import storeMudConfig from "@latticexyz/store/mud.config.mjs";
import worldMudConfig from "@latticexyz/world/mud.config.mjs";

await tsgen(parseStoreConfig(storeMudConfig), "src/mud-definitions/store")
await tsgen(parseStoreConfig(worldMudConfig), "src/mud-definitions/world")