import { SQLiteSyncDialect, SQLiteTableWithColumns, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
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

const sqliteDialect = new SQLiteSyncDialect();

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

  const createTableSql = sql.raw(`CREATE TABLE [${tableName}] (\n`);
  Object.keys(columns).forEach((columnName) => {
    const column = table[columnName];
    createTableSql.append(sql.raw(`${columnName} ${column.getSQLType()} NOT NULL`));
    if (column.notNull) {
      createTableSql.append(sql.raw(` NOT NULL`));
    }
    if (column.hasDefault) {
      // CREATE query doesn't seem to like parameterized values, so we escape them manually
      // TODO: test this thoroughly or find a different approach
      createTableSql.append(sql.raw(` DEFAULT "${sqliteDialect.escapeString((column.default as any).toString())}"`));
    }
    createTableSql.append(sql.raw(`,\n`));
  });
  createTableSql.append(sql`PRIMARY KEY(`);
  Object.keys(keyColumns).forEach((columnName, i) => {
    if (i > 0) {
      createTableSql.append(sql.raw(`, `));
    }
    createTableSql.append(sql.raw(`${columnName}`));
  });
  createTableSql.append(sql.raw(`)\n`));
  createTableSql.append(sql.raw(`)`));

  return { table, createTableSql };
}
