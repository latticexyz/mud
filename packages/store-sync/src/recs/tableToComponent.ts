import { Component, Type, World, defineComponent } from "@latticexyz/recs";
import { StoreComponentMetadata } from "./common";
import { SchemaAbiTypeToRecsType, schemaAbiTypeToRecsType } from "./schemaAbiTypeToRecsType";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { Table } from "@latticexyz/store";
import { mapObject } from "@latticexyz/common/utils";

export type TableToComponent<table extends Table> = Component<
  {
    __staticData: Type.OptionalString;
    __encodedLengths: Type.OptionalString;
    __dynamicData: Type.OptionalString;
  } & {
    [fieldName in keyof table["valueSchema"] & string]: Type &
      SchemaAbiTypeToRecsType<SchemaAbiType & table["valueSchema"][fieldName]["type"]>;
  },
  StoreComponentMetadata & {
    componentName: table["name"];
    tableName: `${table["namespace"]}:${table["name"]}`;
    keySchema: { [name in keyof table["keySchema"] & string]: table["keySchema"][name]["type"] };
    valueSchema: { [name in keyof table["valueSchema"] & string]: table["valueSchema"][name]["type"] };
  }
>;

export function tableToComponent<table extends Table>(world: World, table: table): TableToComponent<table> {
  return defineComponent(
    world,
    {
      ...Object.fromEntries(
        Object.entries(table.valueSchema).map(([fieldName, { type: schemaAbiType }]) => [
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
        keySchema: mapObject(table.keySchema, ({ type }) => type),
        valueSchema: mapObject(table.valueSchema, ({ type }) => type),
      },
    }
  ) as TableToComponent<table>;
}
