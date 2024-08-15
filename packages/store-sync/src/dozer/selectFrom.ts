import { Table } from "@latticexyz/config";
import { DozerTableQuery } from "./common";

// For autocompletion but still allowing all SQL strings
export type Where<table extends Table> = `"${keyof table["schema"] & string}"` | (string & {});

export type SelectFromArgs<table extends Table> = { table: table; where?: Where<table>; limit?: number };

export function selectFrom<table extends Table>({ table, where, limit }: SelectFromArgs<table>): DozerTableQuery {
  const dozerTableLabel = table.namespace === "" ? table.name : `${table.namespace}__${table.name}`;
  return {
    table: table,
    sql: `select ${Object.keys(table.schema)
      .map((key) => `"${key}"`)
      .join(
        ", ",
      )} from ${dozerTableLabel}${where != null ? ` where ${where}` : ""}${limit != null ? ` limit ${limit}` : ""}`,
  };
}
