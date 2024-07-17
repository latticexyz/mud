import { Schema, Table } from "@latticexyz/config";

type PartialTable = Pick<Table, "schema" | "key">;

export type getKeySchema<table extends PartialTable> = PartialTable extends table
  ? Schema
  : {
      readonly [fieldName in Extract<keyof table["schema"], table["key"][number]>]: table["schema"][fieldName];
    };

export function getKeySchema<table extends PartialTable>(table: table): getKeySchema<table> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, table.schema[fieldName]])) as getKeySchema<table>;
}
