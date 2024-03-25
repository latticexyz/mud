import { Table } from "@latticexyz/config";

export type getKeySchema<table extends Table> = {
  [fieldName in table["key"][number]]: table["schema"][fieldName];
};

export function getKeySchema<table extends Table>(table: table): getKeySchema<table> {
  return Object.fromEntries(table.key.map((fieldName) => [fieldName, table.schema[fieldName]])) as getKeySchema<table>;
}
