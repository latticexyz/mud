export { loadStoreConfig } from "./config/loadStoreConfig.js";
export { parseStoreConfig } from "./config/parseStoreConfig.js";
export { loadWorldConfig, resolveWorldConfig, parseWorldConfig } from "./config/world/index.js";
export { resolveTableId } from "./config/dynamicResolution.js";

export type {
  StoreUserConfig,
  StoreConfig,
  WorldUserConfig,
  ResolvedWorldConfig,
  MUDUserConfig,
  MUDConfig,
} from "./config/index.js";

export { storeConfig, mudConfig } from "./config/index.js";
