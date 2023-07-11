import { SQLiteSyncDialect, SQLiteTableWithColumns, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { buildSqliteColumn } from "./buildSqliteColumn";
import { ColumnDataType, Kysely, SqliteDialect } from "kysely";
import SqliteDatabase from "better-sqlite3";

type CreateSqliteTableOptions = {
  namespace: string;
  name: string;
  keySchema: Record<string, StaticAbiType>;
  valueSchema: Record<string, SchemaAbiType>;
};

type CreateSqliteTableResult = {
  // TODO: refine type
  table: SQLiteTableWithColumns<any>;
  createTableSql: string;
};

const sqliteDialect = new SQLiteSyncDialect();
const db = new Kysely<any>({
  dialect: new SqliteDialect({ database: new SqliteDatabase(":memory:") }),
});

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

  let query = db.schema.createTable(tableName);
  Object.keys(columns).forEach((columnName) => {
    const column = table[columnName];
    query = query.addColumn(columnName, column.getSQLType() as ColumnDataType, (col) => {
      if (column.notNull) col = col.notNull();
      if (column.hasDefault) col = col.defaultTo(column.default);
      return col;
    });
  });
  query = query.addPrimaryKeyConstraint(`${tableName}__primary_key`, Object.keys(keyColumns) as any);

  const { sql: createTableSql } = query.compile();

  return { table, createTableSql };
}
