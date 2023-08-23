import { AnyPgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";
import { getTableColumns, getTableName } from "drizzle-orm";
import {
  ColumnDataType,
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { getSchema } from "./getSchema";

export function tableToSql(table: PgTableWithColumns<any>): string {
  let db = new Kysely({
    dialect: {
      createAdapter: (): PostgresAdapter => new PostgresAdapter(),
      createDriver: (): DummyDriver => new DummyDriver(),
      createIntrospector: (db: Kysely<unknown>): PostgresIntrospector => new PostgresIntrospector(db),
      createQueryCompiler: (): PostgresQueryCompiler => new PostgresQueryCompiler(),
    },
  });

  const schema = getSchema(table);
  if (schema) {
    // TODO: create schema if we have one
    db = db.withSchema(schema);
  }

  const tableName = getTableName(table);

  // TODO: should we allow this to fail (remove ifNotExists) so we can catch issues with our logic that creates tables?
  let query = db.schema.createTable(tableName).ifNotExists();

  const columns = Object.values(getTableColumns(table)) as AnyPgColumn[];
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
    query = query.addPrimaryKeyConstraint(`${tableName}__pk`, primaryKeys as any);
  }

  const { sql } = query.compile();
  return sql;
}
