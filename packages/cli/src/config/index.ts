import { StringForUnion } from "../utils/typeUtils.js";
import { StoreUserConfig, StoreConfig } from "./parseStoreConfig.js";
import { WorldUserConfig, ResolvedWorldConfig } from "./world/index.js";

export type MUDUserConfig<EnumNames extends StringForUnion = StringForUnion> = StoreUserConfig<EnumNames> &
  WorldUserConfig;
export type MUDConfig = StoreConfig & ResolvedWorldConfig;

/** Type helper for defining MUDUserConfig */
export function mudConfig<EnumNames extends StringForUnion = StringForUnion>(config: MUDUserConfig<EnumNames>) {
  return config;
}

export * from "./commonSchemas.js";
export * from "./loadConfig.js";
export * from "./loadStoreConfig.js";
export * from "./parseStoreConfig.js";
export * from "./world/index.js";
export * from "./validation.js";
export * from "./dynamicResolution.js";
