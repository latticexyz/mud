import { parseStoreConfig, StoreUserConfig, FullTableConfig } from "@latticexyz/cli/src/config/parseStoreConfig";
import { TableId } from "@latticexyz/utils";
import { World, Component } from "../types";
import { Type as RecsType } from "../constants";
import { defineComponent } from "../Component";

import { SchemaType } from "@latticexyz/schema-type";
import { schemaTypesToRecsTypes } from "./schemaTypesToRecsTypes";

type SchemaTypeToRecsType<T extends SchemaType> = (typeof schemaTypesToRecsTypes)[T];

type TableSchemaToComponentSchema<TableSchema extends FullTableConfig["schema"]> = {
  [K in keyof TableSchema]: TableSchema[K] extends SchemaType
    ? SchemaTypeToRecsType<TableSchema[K]>
    : TableSchema[K] extends string
    ? RecsType.T // TODO: support user enums (strings)
    : RecsType.T;
};

type TablesToComponents<Tables extends StoreUserConfig["tables"]> = {
  [K in keyof Tables]: Tables[K] extends FullTableConfig
    ? Component<
        TableSchemaToComponentSchema<Tables[K]["schema"]>,
        { contractId: string; tableId: string; table: Tables[K] }
      >
    : Tables[K] extends SchemaType
    ? Component<
        TableSchemaToComponentSchema<{ value: Tables[K] }>,
        { contractId: string; tableId: string; table: Tables[K] }
      >
    : unknown; // TODO: support user enums (strings)
};

const tableSchemaToRecsSchema = <TableSchema extends FullTableConfig["schema"]>(
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

export function defineStoreComponents<T extends StoreUserConfig>(world: World, userConfig: T) {
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

  return components as TablesToComponents<T["tables"]>;
}
