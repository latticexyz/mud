import { ExtractUserTypes, StringForUnion } from "@latticexyz/common/type-utils";
import { Config } from "./types";

export function defineStoreConfig<
  // (`never` is overridden by inference, so only the defined enums can be used by default)
  EnumNames extends StringForUnion = never,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>,
  C extends Config<EnumNames, StaticUserTypes> = Config<EnumNames, StaticUserTypes>
>(config: C & Config<EnumNames, StaticUserTypes>): C {
  return config;
}
