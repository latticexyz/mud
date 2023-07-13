import { AnySQLiteColumnBuilder, SQLiteTableWithColumns, sqliteTable } from "drizzle-orm/sqlite-core";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { buildSqliteColumn } from "./buildSqliteColumn";

type CreateSqliteTableOptions = {
  namespace: string;
  name: string;
  keyTupleSchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, SchemaAbiType>;
};

// TODO: refine type
type CreateSqliteTableResult = {
  tableName: string;
  table: SQLiteTableWithColumns<any>;
  metaColumnNames: string[];
};

export function createSqliteTable({
  namespace,
  name,
  keyTupleSchema,
  valueSchema,
}: CreateSqliteTableOptions): CreateSqliteTableResult {
  // TODO: colon-separated is okay in sqlite but maybe not in postgres, and maybe not as ergonomic?
  const tableName = `${namespace}:${name}`;

  const keyColumns = Object.fromEntries(
    Object.entries(keyTupleSchema).map(([name, type]) => [name, buildSqliteColumn(name, type).notNull().primaryKey()])
  );

  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildSqliteColumn(name, type).notNull()])
  );

  const metaColumns: Record<string, AnySQLiteColumnBuilder> = {
    __lastUpdatedBlockNumber: buildSqliteColumn("__lastUpdatedBlockNumber", "uint256").notNull(),
    // TODO: last updated block hash?
    __isDeleted: buildSqliteColumn("__isDeleted", "bool").notNull(),
  };
  if (Object.keys(keyTupleSchema).length === 0) {
    metaColumns.__singleton = buildSqliteColumn("__singleton", "bool").notNull().primaryKey();
  }

  // TODO: make sure there are no meta columns that overlap with key/value columns
  // TODO: index meta columns?

  const columns = {
    ...keyColumns,
    ...valueColumns,
    ...metaColumns,
  };

  const table = sqliteTable(tableName, columns);

  // We have to return a table name because SQLiteTableWithColumns has no way to get it, even though its part of the contructor
  return { tableName, table, metaColumnNames: Object.keys(metaColumns) };
}
