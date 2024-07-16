import { Schema, Table } from "@latticexyz/config";

export type getKeySchema<table extends Table> = Table extends table
  ? Schema
  : {
      readonly [fieldName in Extract<keyof table["schema"], table["key"][number]>]: table["schema"][fieldName];
    };

export function getKeySchema<table extends Table>(table: table): getKeySchema<table> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, table.schema[fieldName]])) as getKeySchema<table>;
}
