import { AsDependent, ExtractUserTypes, StringForUnion } from "@latticexyz/common/type-utils";
import { PathsConfig, ExpandedPathsConfig } from "./paths";
import { TablesConfig, ExpandedTablesConfig } from "./tables";
import { EnumsConfig, ExpandedEnumsConfig } from "./enums";

export type StoreConfig<
  EnumNames extends StringForUnion = StringForUnion,
  StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>
> = PathsConfig & EnumsConfig<EnumNames> & TablesConfig<AsDependent<StaticUserTypes>, AsDependent<StaticUserTypes>>;

export type ExpandedStoreConfig<I extends StoreConfig = StoreConfig> = ExpandedPathsConfig<I> &
  ExpandedEnumsConfig<I> &
  ExpandedTablesConfig<I>;
