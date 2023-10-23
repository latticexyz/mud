import { Type, World, defineComponent } from "@latticexyz/recs";
import { TableInput, TableToRecsComponent } from "./common";
import { schemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";
import { SchemaAbiType } from "@latticexyz/schema-type";

export function tableToRecsComponent<table extends TableInput>(
  world: World,
  table: table
): TableToRecsComponent<table> {
  return defineComponent(
    world,
    {
      ...Object.fromEntries(
        Object.entries(table.valueSchema).map(([fieldName, schemaAbiType]) => [
          fieldName,
          schemaAbiTypeToRecsType[schemaAbiType as SchemaAbiType],
        ])
      ),
      __staticData: Type.OptionalString,
      __encodedLengths: Type.OptionalString,
      __dynamicData: Type.OptionalString,
    },
    {
      id: table.tableId,
      metadata: {
        componentName: table.name,
        tableName: `${table.namespace}:${table.name}`,
        keySchema: table.keySchema,
        valueSchema: table.valueSchema,
      },
    }
  ) as TableToRecsComponent<table>;
}
