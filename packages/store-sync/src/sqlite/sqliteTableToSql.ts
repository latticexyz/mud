import { AnySQLiteColumn, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { ColumnDataType, DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import { getTableColumns, getTableName } from "drizzle-orm";

const db = new Kysely<any>({
  dialect: {
    createAdapter: (): SqliteAdapter => new SqliteAdapter(),
    createDriver: (): DummyDriver => new DummyDriver(),
    createIntrospector: (db: Kysely<unknown>): SqliteIntrospector => new SqliteIntrospector(db),
    createQueryCompiler: (): SqliteQueryCompiler => new SqliteQueryCompiler(),
  },
});

export function sqliteTableToSql(table: SQLiteTableWithColumns<any>): string {
  const tableName = getTableName(table);

  // TODO: should we allow this to fail (remove ifNotExists) so we can catch issues with our logic that creates tables?
  let query = db.schema.createTable(tableName).ifNotExists();

  const columns = Object.values(getTableColumns(table)) as AnySQLiteColumn[];
  for (const column of columns) {
    query = query.addColumn(column.name, column.getSQLType() as ColumnDataType, (col) => {
      if (column.notNull) {
        col = col.notNull();
      }
      if (column.hasDefault && typeof column.default !== "undefined") {
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
