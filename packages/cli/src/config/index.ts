import { ExtractUserTypes, StringForUnion } from "../utils/typeUtils.js";
import { StoreUserConfig, StoreConfig } from "./parseStoreConfig.js";
import { WorldUserConfig, ResolvedWorldConfig } from "./world/index.js";

export type MUDUserConfig<
  EnumNames extends StringForUnion = StringForUnion,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>
> = StoreUserConfig<EnumNames, StaticUserTypes> & WorldUserConfig;

export type MUDConfig = StoreConfig & ResolvedWorldConfig;

export function mudConfig<
  EnumNames extends StringForUnion = never,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>
>(config: MUDUserConfig<EnumNames, StaticUserTypes>) {
  return config;
}

export * from "./commonSchemas.js";
export * from "./loadConfig.js";
export * from "./loadStoreConfig.js";
export * from "./parseStoreConfig.js";
export * from "./world/index.js";
export * from "./validation.js";
export * from "./dynamicResolution.js";
