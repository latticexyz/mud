import { StringForUnion } from "@latticexyz/common/type-utils";
import { StoreConfig, TableConfig, UserTypesConfig } from "../storeConfig";
import { UserType } from "@latticexyz/common/codegen";

export type ResolvedStoreConfig<TStoreConfig extends StoreConfig> = TStoreConfig & {
  resolved: {
    tables: {
      [key in keyof TStoreConfig["tables"]]: ResolvedTableConfig<
        TStoreConfig["tables"][key],
        TStoreConfig["userTypes"],
        keyof TStoreConfig["enums"] & string
      >;
    };
  };
};

export type ResolvedTableConfig<
  TTableConfig extends TableConfig,
  TUserTypes extends UserTypesConfig,
  TEnumNames extends StringForUnion
> = Omit<TTableConfig, "keySchema" | "valueSchema"> & {
  keySchema: ResolvedSchema<TTableConfig["keySchema"], TUserTypes, TEnumNames>;
  valueSchema: ResolvedSchema<TTableConfig["valueSchema"], TUserTypes, TEnumNames>;
};

export type ResolvedSchema<
  TSchema extends TableConfig["keySchema"] | TableConfig["valueSchema"],
  TUserTypes extends UserTypesConfig,
  TEnumNames extends StringForUnion
> = {
  [key in keyof TSchema]: {
    type: TSchema[key] extends keyof TUserTypes
      ? TUserTypes[TSchema[key]] extends UserType
        ? // Note: we mistakenly named the plain ABI type "internalType",
          // while in Solidity ABIs the plain ABI type is called "type" and
          // and the custom type "internalType". We're planning to
          // change our version and align with Solidity ABIs going forward.
          TUserTypes[TSchema[key]]["internalType"]
        : never
      : TSchema[key] extends TEnumNames
      ? "uint8"
      : TSchema[key];
    internalType: TSchema[key];
  };
};

export function resolveConfig<TStoreConfig extends StoreConfig>(
  config: TStoreConfig
): ResolvedStoreConfig<TStoreConfig> {
  return config as ResolvedStoreConfig<TStoreConfig>;
}
