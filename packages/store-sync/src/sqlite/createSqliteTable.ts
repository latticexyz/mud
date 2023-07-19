import { AnySQLiteColumnBuilder, SQLiteTableWithColumns, sqliteTable } from "drizzle-orm/sqlite-core";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { buildSqliteColumn } from "./buildSqliteColumn";
import { Address } from "viem";
import { getTableName } from "./getTableName";

type CreateSqliteTableOptions = {
  address: Address;
  namespace: string;
  name: string;
  keySchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, SchemaAbiType>;
};

// TODO: refine type
type CreateSqliteTableResult = {
  tableName: string;
  table: SQLiteTableWithColumns<any>;
  metaColumnNames: string[];
};

export function createSqliteTable({
  address,
  namespace,
  name,
  keySchema,
  valueSchema,
}: CreateSqliteTableOptions): CreateSqliteTableResult {
  const tableName = getTableName(address, namespace, name);

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildSqliteColumn(name, type).notNull()])
  );

  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildSqliteColumn(name, type).notNull()])
  );

  const metaColumns: Record<string, AnySQLiteColumnBuilder> = {
    __key: buildSqliteColumn("__key", "bytes").notNull().primaryKey(),
    __lastUpdatedBlockNumber: buildSqliteColumn("__lastUpdatedBlockNumber", "uint256").notNull(),
    // TODO: last updated block hash?
    __isDeleted: buildSqliteColumn("__isDeleted", "bool").notNull(),
  };

  // TODO: unqiue constraint on key columns?

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
