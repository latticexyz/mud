import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { ColumnDataType, Kysely, SqliteDialect } from "kysely";
import SqliteDatabase from "better-sqlite3";

const db = new Kysely<any>({
  dialect: new SqliteDialect({ database: new SqliteDatabase(":memory:") }),
});

// TODO: figure out how to extract table name from SQLiteTableWithColumns (it's in there just not exposed)
export function sqliteTableToSql(tableName: string, table: SQLiteTableWithColumns<any>): string {
  const columnNames = Object.getOwnPropertyNames(table);
  const primaryKeys = columnNames.filter((columnName) => table[columnName].primary);

  let query = db.schema.createTable(tableName);

  columnNames.forEach((columnName) => {
    const column = table[columnName];
    query = query.addColumn(column.name, column.getSQLType() as ColumnDataType, (col) => {
      if (column.notNull) {
        col = col.notNull();
      }
      if (column.hasDefault && typeof column.default !== "undefined") {
        col = col.defaultTo(column.default);
      }
      return col;
    });
  });

  query = query.addPrimaryKeyConstraint(`${tableName}__primary_key`, primaryKeys as any);

  const { sql } = query.compile();
  return sql;
}
