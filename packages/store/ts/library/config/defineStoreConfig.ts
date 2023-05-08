import { ExtractUserTypes, StringForUnion } from "@latticexyz/common/type-utils";
import { StoreConfig } from "./types";

export function defineStoreConfig<
  // (`never` is overridden by inference, so only the defined enums can be used by default)
  EnumNames extends StringForUnion = never,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>,
  C extends StoreConfig<EnumNames, StaticUserTypes> = StoreConfig<EnumNames, StaticUserTypes>
>(config: C & StoreConfig<EnumNames, StaticUserTypes>): C {
  return config;
}
