import {
  parseStoreConfig,
  StoreUserConfig,
  TableConfig,
  FullSchemaConfig,
  ShorthandSchemaConfig,
} from "@latticexyz/cli/src/config/parseStoreConfig";
import { TableId } from "@latticexyz/utils";
import { World, Component } from "../types";
import { Type as RecsType } from "../constants";
import { defineComponent } from "../Component";

import { AbiType } from "@latticexyz/schema-type";
import { abiTypesToRecsTypes } from "./abiTypesToRecsTypes";

type AbiOrUserTypeToRecsType<T extends string> = T extends AbiType
  ? (typeof abiTypesToRecsTypes)[T]
  : T extends string
  ? // TODO: better support user enums
    RecsType.Number
  : never;

type TableSchemaToComponentSchema<TableSchema extends FullSchemaConfig> = {
  [K in keyof TableSchema]: AbiOrUserTypeToRecsType<TableSchema[K]>;
};

type TablesToComponents<Tables extends Record<string, TableConfig>> = {
  [K in keyof Tables]: Component<
    TableSchemaToComponentSchema<ExpandSchema<Tables[K]["schema"]>>,
    { contractId: string; tableId: string; table: Tables[K] }
  >;
};

type ExpandSchema<TableSchema extends TableConfig["schema"]> = TableSchema extends FullSchemaConfig
  ? TableSchema
  : TableSchema extends ShorthandSchemaConfig
  ? {
      value: TableSchema;
    }
  : never;

type ExpandTables<Tables extends StoreUserConfig["tables"]> = {
  [K in keyof Tables]: Tables[K] extends TableConfig
    ? Tables[K]
    : Tables[K] extends AbiType
    ? { schema: { value: Tables[K] } }
    : Tables[K] extends string
    ? // TODO: better support for user enums
      { schema: { value: "uint8" } }
    : never;
};

export type StoreUserConfigToComponents<Config extends StoreUserConfig> = TablesToComponents<
  ExpandTables<Config["tables"]>
>;

function isAbiType(value: string): value is AbiType {
  return value in abiTypesToRecsTypes;
}

const tableSchemaToRecsSchema = <TableSchema extends FullSchemaConfig>(
  tableSchema: TableSchema
): TableSchemaToComponentSchema<TableSchema> => {
  return Object.fromEntries(
    Object.entries(tableSchema).map(([fieldName, abiType]) => [
      fieldName,
      isAbiType(abiType) ? abiTypesToRecsTypes[abiType] : RecsType.T, // TODO: support user enums
    ])
  ) as any;
};

export function defineStoreComponents<Config extends StoreUserConfig>(
  world: World,
  userConfig: Config
): StoreUserConfigToComponents<Config> {
  // TODO: extend parseStoreConfig to translate StoreUserConfig to StoreConfig and keep originating types
  const config = parseStoreConfig(userConfig);

  const components = Object.fromEntries(
    Object.entries(config.tables).map(([tableName, table]) => {
      const tableId = new TableId(config.namespace, table.fileSelector);
      const schema = tableSchemaToRecsSchema(table.schema);
      const component = defineComponent(world, schema, {
        metadata: { contractId: tableId.toHexString(), tableId: tableId.toString(), table },
      });
      return [tableName, component];
    })
  );

  // TODO: figure out how to map types so we don't have to cast
  return components as any;
}
