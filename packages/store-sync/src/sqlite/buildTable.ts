import { SQLiteColumnBuilderBase, SQLiteTableWithColumns, sqliteTable } from "drizzle-orm/sqlite-core";
import { buildColumn } from "./buildColumn";
import { getTableName } from "./getTableName";
import { snakeCase } from "../snakeCase";
import { PartialTable } from "./common";

export const metaColumns = {
  __key: buildColumn("__key", "bytes").primaryKey(),
  __staticData: buildColumn("__staticData", "bytes"),
  __encodedLengths: buildColumn("__encodedLengths", "bytes"),
  __dynamicData: buildColumn("__dynamicData", "bytes"),
  __lastUpdatedBlockNumber: buildColumn("__lastUpdatedBlockNumber", "uint256").notNull(),
  // TODO: last updated block hash?
  __isDeleted: buildColumn("__isDeleted", "bool").notNull(),
} as const satisfies Record<string, SQLiteColumnBuilderBase>;

type SQLiteTableFromSchema<table extends PartialTable> = SQLiteTableWithColumns<{
  dialect: "sqlite";
  name: string;
  schema: string | undefined;
  columns: {
    // TODO: figure out column types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [metaColumn in keyof typeof metaColumns | keyof table["keySchema"] | keyof table["valueSchema"]]: any;
  };
}>;

type BuildTableOptions<table extends PartialTable> = table;
type BuildTableResult<table extends PartialTable> = SQLiteTableFromSchema<table>;

export function buildTable<table extends PartialTable>({
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: BuildTableOptions<table>): BuildTableResult<table> {
  const tableName = getTableName(address, namespace, name);

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildColumn(snakeCase(name), type).notNull()]),
  );

  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildColumn(snakeCase(name), type).notNull()]),
  );

  // TODO: unique constraint on key columns?

  // TODO: make sure there are no meta columns that overlap with key/value columns
  // TODO: index meta columns?

  const columns = {
    ...keyColumns,
    ...valueColumns,
    ...metaColumns,
  };

  const table = sqliteTable(tableName, columns);

  return table as never;
}
