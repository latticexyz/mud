import { Table } from "@latticexyz/config";
import { TableQuery } from "./common";

// For autocompletion but still allowing all SQL strings
export type Where<table extends Table> = `"${keyof table["schema"] & string}"` | (string & {});

export type SelectFromArgs<table extends Table> = { table: table; where?: Where<table>; limit?: number };

export function selectFrom<table extends Table>({ table, where, limit }: SelectFromArgs<table>): TableQuery {
  return {
    table: table,
    sql: `select ${Object.keys(table.schema)
      // .map((key) => `"${key}"`)
      .join(
        ", ",
      )} from ${table.namespace}__${table.name}${where != null ? ` where ${where}` : ""}${limit != null ? ` limit ${limit}` : ""}`,
  };
}
