import { SQLiteTableWithColumns, sqliteTable } from "drizzle-orm/sqlite-core";
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

const db = new Kysely<any>({
  dialect: new SqliteDialect({ database: new SqliteDatabase(":memory:") }),
});

export async function createSqliteTable({
  namespace,
  name,
  keySchema,
  valueSchema,
}: CreateSqliteTableOptions): Promise<CreateSqliteTableResult> {
  // TODO: colon-separated is okay in sqlite but maybe not in postgres, and maybe not as ergonomic?
  const tableName = `${namespace}:${name}`;

  const keyColumns = Object.fromEntries(
    Object.entries(keySchema).map(([name, type]) => [name, buildSqliteColumn(name, type).primaryKey()])
  );
  const valueColumns = Object.fromEntries(
    Object.entries(valueSchema).map(([name, type]) => [name, buildSqliteColumn(name, type)])
  );
  const columns = {
    ...keyColumns,
    ...valueColumns,
  };

  const table = sqliteTable(tableName, columns);

  let query = db.schema.createTable(tableName);
  const primaryKeys: string[] = [];
  Object.keys(columns).forEach((columnName) => {
    const column = table[columnName];
    query = query.addColumn(columnName, column.getSQLType() as ColumnDataType, (col) => {
      if (column.notNull) col = col.notNull();
      if (column.hasDefault) col = col.defaultTo(column.default);
      if (column.primary) primaryKeys.push(columnName);
      return col;
    });
  });
  query = query.addPrimaryKeyConstraint(`${tableName}__primary_key`, primaryKeys as any);

  const { sql: createTableSql } = query.compile();

  return { table, createTableSql };
}
