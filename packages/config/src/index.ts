import { ExtractUserTypes, StringForUnion } from "./typeUtils";
import { StoreUserConfig, StoreConfig } from "./store/parseStoreConfig";
import { WorldUserConfig, ResolvedWorldConfig } from "./world/index";

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

export * from "./commonSchemas";
export * from "./loadConfig";
export * from "./store/loadStoreConfig";
export * from "./store/parseStoreConfig";
export * from "./world/index";
export * from "./validation";
export * from "./dynamicResolution";
export * from "./errors";
