import { StringForUnion } from "@latticexyz/common/type-utils";
import { StoreConfig, TableConfig, UserTypesConfig } from "../storeConfig";
import { UserType } from "@latticexyz/common/codegen";
import { mapObject } from "@latticexyz/common/utils";
import { resourceToHex } from "@latticexyz/common";
import { SchemaAbiType } from "@latticexyz/schema-type";

/**
 * @internal Internal only
 * @deprecated Internal only
 */
export type ResolvedStoreConfig<TStoreConfig extends StoreConfig> = {
  tables: {
    [TableKey in keyof TStoreConfig["tables"] & string]: ResolvedTableConfig<
      TStoreConfig["tables"][TableKey],
      TStoreConfig["userTypes"],
      keyof TStoreConfig["enums"] & string,
      TStoreConfig["namespace"],
      TableKey
    >;
  };
};

type ResolvedTableConfig<
  TTableConfig extends TableConfig,
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnumNames extends StringForUnion,
  TNamespace extends string = string,
  TName extends string = string
> = {
  keySchema: ResolvedKeySchema<TTableConfig["keySchema"], TUserTypes, TEnumNames>;
  valueSchema: ResolvedValueSchema<TTableConfig["valueSchema"], TUserTypes, TEnumNames>;
  namespace: TNamespace;
  name: TName;
  tableId: `0x${string}`;
};

type ResolvedKeySchema<
  TKeySchema extends TableConfig["keySchema"],
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnumNames extends StringForUnion
> = ResolvedSchema<TKeySchema, TUserTypes, TEnumNames>;

type ResolvedValueSchema<
  TValueSchema extends TableConfig["valueSchema"],
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnumNames extends StringForUnion
> = ResolvedSchema<Exclude<TValueSchema, string>, TUserTypes, TEnumNames>;

type ResolvedSchema<
  TSchema extends Exclude<TableConfig["keySchema"] | TableConfig["valueSchema"], string>,
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnumNames extends StringForUnion
> = {
  [key in keyof TSchema]: {
    type: TSchema[key] extends SchemaAbiType
      ? TSchema[key]
      : TSchema[key] extends keyof TUserTypes
      ? TUserTypes[TSchema[key]] extends UserType
        ? // Note: we mistakenly named the plain ABI type "internalType",
          // while in Solidity ABIs the plain ABI type is called "type" and
          // and the custom type "internalType". We're planning to
          // change our version and align with Solidity ABIs going forward.
          TUserTypes[TSchema[key]]["internalType"]
        : never
      : TSchema[key] extends TEnumNames
      ? "uint8"
      : never;
    internalType: TSchema[key];
  };
};

/**
 * @internal Internal only
 * @deprecated Internal only
 */
export function resolveConfig<TStoreConfig extends StoreConfig>(
  config: TStoreConfig
): ResolvedStoreConfig<TStoreConfig> {
  const resolvedTables: Record<string, ReturnType<typeof resolveTable>> = {};

  for (const key of Object.keys(config.tables)) {
    resolvedTables[key] = resolveTable(
      config.tables[key],
      config.userTypes,
      Object.keys(config.enums),
      config.namespace,
      key
    ) as ReturnType<typeof resolveTable>;
  }

  return {
    tables: resolvedTables as ResolvedStoreConfig<TStoreConfig>["tables"],
  };
}

function resolveTable<
  TTableConfig extends TableConfig,
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnums extends StringForUnion[],
  TNamespace extends string,
  TName extends string
>(
  tableConfig: TTableConfig,
  userTypes: TUserTypes,
  enums: TEnums,
  namespace: TNamespace,
  name: TName
): ResolvedTableConfig<typeof tableConfig, TUserTypes, TEnums[number]> {
  const { keySchema, valueSchema } = tableConfig;

  return {
    keySchema: resolveKeySchema(keySchema, userTypes, enums),
    valueSchema: resolveValueSchema(valueSchema, userTypes, enums) as ResolvedSchema<
      Exclude<TTableConfig["valueSchema"], string>,
      TUserTypes,
      TEnums[number]
    >,
    namespace,
    name,
    tableId: resourceToHex({ type: tableConfig.offchainOnly ? "offchainTable" : "table", namespace, name }),
  };
}

function resolveKeySchema<
  TKeySchema extends TableConfig["keySchema"],
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnums extends StringForUnion[]
>(
  keySchema: TKeySchema,
  userTypes: TUserTypes,
  enums: TEnums
): ResolvedKeySchema<TKeySchema extends undefined ? { key: "bytes32" } : TKeySchema, TUserTypes, TEnums[number]> {
  const schema = (
    keySchema == null ? { key: "bytes32" } : typeof keySchema === "string" ? { key: keySchema } : keySchema
  ) as TKeySchema extends undefined ? { key: "bytes32" } : TKeySchema;
  return resolveSchema(schema, userTypes, enums);
}

function resolveValueSchema<
  TValueSchema extends TableConfig["valueSchema"],
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnums extends StringForUnion[]
>(
  valueSchema: TValueSchema,
  userTypes: TUserTypes,
  enums: TEnums
): ResolvedValueSchema<TValueSchema, TUserTypes, TEnums[number]> {
  const schema = (
    typeof valueSchema === "string" ? ({ value: valueSchema } as unknown as TValueSchema) : valueSchema
  ) as Exclude<TValueSchema, string>;
  return resolveSchema(schema, userTypes, enums);
}

function resolveSchema<
  TSchema extends Exclude<NonNullable<TableConfig["keySchema"]> | TableConfig["valueSchema"], string>,
  TUserTypes extends UserTypesConfig["userTypes"],
  TEnums extends StringForUnion[]
>(schema: TSchema, userTypes: TUserTypes, enums: TEnums): ResolvedSchema<TSchema, TUserTypes, TEnums[number]> {
  return mapObject<TSchema, ResolvedSchema<TSchema, TUserTypes, TEnums[number]>>(schema, (value, key) => {
    const isUserType = userTypes && value in userTypes;
    const isEnum = enums.includes(value);
    return {
      type: (isUserType ? userTypes[value].internalType : isEnum ? ("uint8" as const) : value) as ResolvedSchema<
        TSchema,
        TUserTypes,
        TEnums[number]
      >[typeof key]["type"],
      internalType: value,
    };
  });
}
