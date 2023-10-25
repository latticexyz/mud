import { StoreConfig, TableConfig, UserTypesConfig } from "../storeConfig";
import { UserType } from "@latticexyz/common/codegen";

export type ResolvedStoreConfig<TStoreConfig extends StoreConfig> = TStoreConfig & {
  resolved: {
    tables: {
      [key in keyof TStoreConfig["tables"]]: ResolvedTableConfig<
        TStoreConfig["tables"][key],
        TStoreConfig["userTypes"]
      >;
    };
  };
};

export type ResolvedTableConfig<TTableConfig extends TableConfig, TUserTypes extends UserTypesConfig> = Omit<
  TTableConfig,
  "keySchema" | "valueSchema"
> & {
  keySchema: ResolvedSchema<TTableConfig["keySchema"], TUserTypes>;
  valueSchema: ResolvedSchema<TTableConfig["valueSchema"], TUserTypes>;
};

export type ResolvedSchema<
  TSchema extends TableConfig["keySchema"] | TableConfig["valueSchema"],
  TUserTypes extends UserTypesConfig
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
      : TSchema[key];
    internalType: TSchema[key];
  };
};

export function resolveConfig<TStoreConfig extends StoreConfig>(
  config: TStoreConfig
): ResolvedStoreConfig<TStoreConfig> {
  return config as ResolvedStoreConfig<TStoreConfig>;
}
