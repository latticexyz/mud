import { AnySQLiteColumn, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { ColumnDataType, Kysely, SqliteDialect } from "kysely";
import SqliteDatabase from "better-sqlite3";
import { getTableColumns, getTableName } from "drizzle-orm";

const db = new Kysely<any>({
  dialect: new SqliteDialect({ database: new SqliteDatabase(":memory:") }),
});

export function sqliteTableToSql(table: SQLiteTableWithColumns<any>): string {
  const tableName = getTableName(table);

  let query = db.schema.createTable(tableName).ifNotExists();

  const columns = Object.values(getTableColumns(table)) as AnySQLiteColumn[];
  for (const column of columns) {
    query = query.addColumn(column.name, column.getSQLType() as ColumnDataType, (col) => {
      if (column.notNull) {
        col = col.notNull();
      }
      if (column.hasDefault && typeof column.default !== "undefined") {
        // col = col.defaultTo(column.mapToDriverValue(column.default));
        col = col.defaultTo(column.default);
      }
      return col;
    });
  }

  const primaryKeys = columns.filter((column) => column.primary).map((column) => column.name);
  if (primaryKeys.length) {
    query = query.addPrimaryKeyConstraint(`${tableName}__primaryKey`, primaryKeys as any);
  }

  const { sql } = query.compile();
  return sql;
}
