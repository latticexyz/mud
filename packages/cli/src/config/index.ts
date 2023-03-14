import { StoreUserConfig, StoreConfig } from "./parseStoreConfig.js";
import { WorldUserConfig, ResolvedWorldConfig } from "./loadWorldConfig.js";

export type MUDUserConfig = StoreUserConfig & WorldUserConfig;
export type MUDConfig = StoreConfig & ResolvedWorldConfig;

export * from "./commonSchemas.js";
export * from "./loadConfig.js";
export * from "./loadStoreConfig.js";
export * from "./parseStoreConfig.js";
export * from "./loadWorldConfig.js";
export * from "./validation.js";
