import { StringForUnion } from "@latticexyz/common/type-utils";
import { StoreConfig, TableConfig, UserTypesConfig } from "../storeConfig";
import { UserType } from "@latticexyz/common/codegen";

export type ResolvedStoreConfig<TStoreConfig extends StoreConfig> = TStoreConfig & {
  /** @deprecated Note: this property is experimental and expected to change */
  _resolved: {
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
  keySchema: ResolvedKeySchema<TTableConfig["keySchema"], TUserTypes, TEnumNames>;
  valueSchema: ResolvedValueSchema<TTableConfig["valueSchema"], TUserTypes, TEnumNames>;
};

export type ResolvedKeySchema<
  TKeySchema extends TableConfig["keySchema"],
  TUserTypes extends UserTypesConfig,
  TEnumNames extends StringForUnion
> = ResolvedSchema<TKeySchema, TUserTypes, TEnumNames>;

export type ResolvedValueSchema<
  TValueSchema extends TableConfig["valueSchema"],
  TUserTypes extends UserTypesConfig,
  TEnumNames extends StringForUnion
> = ResolvedSchema<TValueSchema, TUserTypes, TEnumNames>;

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
  const resolvedTables: Record<string, ReturnType<typeof resolveTable>> = {};

  for (const key of Object.keys(config.tables)) {
    resolvedTables[key] = resolveTable(config.tables[key], config.userTypes, Object.keys(config.enums)) as ReturnType<
      typeof resolveTable
    >;
  }

  return {
    ...config,
    _resolved: {
      tables: resolvedTables as ResolvedStoreConfig<TStoreConfig>["_resolved"]["tables"],
    },
  };
}

function resolveTable<
  TTableConfig extends TableConfig,
  TUserTypes extends UserTypesConfig,
  TEnums extends StringForUnion[]
>(
  tableConfig: TTableConfig,
  userTypes: TUserTypes,
  enums: TEnums
): ResolvedTableConfig<TTableConfig, TUserTypes, TEnums[number]> {
  return {
    ...tableConfig,
    keySchema: resolveKeySchema(tableConfig.keySchema ?? { key: "bytes32" }, userTypes, enums),
    valueSchema: resolveValueSchema(tableConfig.valueSchema, userTypes, enums),
  } as ResolvedTableConfig<TTableConfig, TUserTypes, TEnums[number]>;
}

function resolveKeySchema<
  TKeySchema extends TableConfig["keySchema"],
  TUserTypes extends UserTypesConfig,
  TEnums extends StringForUnion[]
>(
  keySchema: TKeySchema,
  userTypes: TUserTypes,
  enums: TEnums
): ResolvedKeySchema<TKeySchema extends undefined ? { key: "bytes32" } : TKeySchema, TUserTypes, TEnums[number]> {
  const schema = (keySchema ?? { key: "bytes32" }) as TKeySchema extends undefined ? { key: "bytes32" } : TKeySchema;
  return resolveSchema(schema, userTypes, enums);
}

function resolveValueSchema<
  TValueSchema extends TableConfig["valueSchema"],
  TUserTypes extends UserTypesConfig,
  TEnums extends StringForUnion[]
>(
  schema: TValueSchema,
  userTypes: TUserTypes,
  enums: TEnums
): ResolvedValueSchema<TValueSchema, TUserTypes, TEnums[number]> {
  return resolveSchema(schema, userTypes, enums);
}

function resolveSchema<
  TSchema extends NonNullable<TableConfig["keySchema"]> | TableConfig["valueSchema"],
  TUserTypes extends UserTypesConfig,
  TEnums extends StringForUnion[]
>(schema: TSchema, { userTypes }: TUserTypes, enums: TEnums): ResolvedSchema<TSchema, TUserTypes, TEnums[number]> {
  const resolvedSchema: Record<string, { internalType: string; type: string }> = {};
  for (const [key, value] of Object.entries(schema)) {
    resolvedSchema[key] = {
      // This mirrors the logic in the `ResolvedSchema` type
      type:
        userTypes && key in userTypes
          ? userTypes[key].internalType
          : enums.includes(value)
          ? ("uint8" as const)
          : value,
      internalType: value,
    };
  }
  return resolvedSchema as ResolvedValueSchema<TSchema, TUserTypes, TEnums[number]>;
}
