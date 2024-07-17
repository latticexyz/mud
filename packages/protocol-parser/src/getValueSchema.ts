import { Schema, Table } from "@latticexyz/config";

type PartialTable = Pick<Table, "schema" | "key">;

export type getValueSchema<table extends PartialTable> = PartialTable extends table
  ? Schema
  : {
      readonly [fieldName in Exclude<keyof table["schema"], table["key"][number]>]: table["schema"][fieldName];
    };

export function getValueSchema<table extends PartialTable>(table: table): getValueSchema<table> {
  return Object.fromEntries(
    Object.entries(table.schema).filter(([fieldName]) => !table.key.includes(fieldName)),
  ) as getValueSchema<table>;
}
