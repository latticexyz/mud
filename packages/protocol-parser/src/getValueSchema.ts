import { Table } from "@latticexyz/config";

// rename this to `tableToValueSchema`?

export type getValueSchema<table extends Table> = {
  readonly [fieldName in Exclude<keyof table["schema"], table["key"][number]>]: table["schema"][fieldName];
};

export function getValueSchema<table extends Table>(table: table): getValueSchema<table> {
  return Object.fromEntries(
    Object.entries(table.schema).filter(([fieldName]) => !table.key.includes(fieldName)),
  ) as getValueSchema<table>;
}
