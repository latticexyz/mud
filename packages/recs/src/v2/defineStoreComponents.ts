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

import { SchemaType } from "@latticexyz/schema-type";
import { schemaTypesToRecsTypes } from "./schemaTypesToRecsTypes";

type SchemaTypeToRecsType<T extends SchemaType> = (typeof schemaTypesToRecsTypes)[T];

type SchemaOrUserTypeToRecsType<T extends SchemaType | string> = T extends SchemaType
  ? SchemaTypeToRecsType<T>
  : T extends string
  ? // TODO: better support user enums
    RecsType.Number
  : never;

type TableSchemaToComponentSchema<TableSchema extends FullSchemaConfig> = {
  [K in keyof TableSchema]: SchemaOrUserTypeToRecsType<TableSchema[K]>;
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
    : Tables[K] extends SchemaType
    ? { schema: { value: Tables[K] } }
    : Tables[K] extends string
    ? // TODO: better support for user enums
      { schema: { value: SchemaType.UINT256 } }
    : never;
};

const tableSchemaToRecsSchema = <TableSchema extends FullSchemaConfig>(
  tableSchema: TableSchema
): TableSchemaToComponentSchema<TableSchema> => {
  return Object.fromEntries(
    Object.entries(tableSchema).map(([fieldName, schemaType]) => [
      fieldName,
      typeof schemaType === "string"
        ? RecsType.T // TODO: support user enums
        : schemaTypesToRecsTypes[schemaType],
    ])
  ) as any;
};

export function defineStoreComponents<T extends StoreUserConfig>(
  world: World,
  userConfig: T
): TablesToComponents<ExpandTables<T["tables"]>> {
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
