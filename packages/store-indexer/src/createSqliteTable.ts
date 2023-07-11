import { SQLiteTableWithColumns, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { buildSqliteColumn } from "./buildSqliteColumn";
import { SQL, sql } from "drizzle-orm";

type CreateSqliteTableOptions = {
  namespace: string;
  name: string;
  keySchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, SchemaAbiType>;
};

type CreateSqliteTableResult = {
  // TODO: refine type
  table: SQLiteTableWithColumns<any>;
  // TODO: should this be SQL type from drizzle-orm?
  createTableSql: SQL;
};

export async function createSqliteTable({
  namespace,
  name,
  keySchema,
  valueSchema,
}: CreateSqliteTableOptions): Promise<CreateSqliteTableResult> {
  const tableName = `${namespace}:${name}`;

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildSqliteColumn(name, type)])
  );
  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildSqliteColumn(name, type)])
  );
  const columns = {
    ...keyColumns,
    ...valueColumns,
  };

  const table = sqliteTable(tableName, columns, (tableConfig) => ({
    primaryKey: primaryKey(...Object.keys(keyColumns).map((columnName) => tableConfig[columnName])),
  }));

  const createTableSql = sql.raw(`
    CREATE TABLE [${tableName}] (
      ${Object.keys(columns)
        // TODO: add defaults
        .map((columnName) => `[${columnName}] ${table[columnName].getSQLType()} NOT NULL`)
        .join(", ")},
      PRIMARY KEY(${Object.keys(keyColumns)
        .map((columnName) => `[${columnName}]`)
        .join(", ")})
    )
  `);

  return { table, createTableSql };
}
