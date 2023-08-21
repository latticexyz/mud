import { AnyPgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";
import {
  ColumnDataType,
  Dialect,
  DummyDriver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from "kysely";
import { getTableColumns, getTableName } from "drizzle-orm";
import { assertExhaustive } from "@latticexyz/common/utils";

function getDialect(dialect: "sqlite" | "postgres"): Dialect {
  if (dialect === "postgres") {
    return {
      createAdapter: (): PostgresAdapter => new PostgresAdapter(),
      createDriver: (): DummyDriver => new DummyDriver(),
      createIntrospector: (db: Kysely<unknown>): PostgresIntrospector => new PostgresIntrospector(db),
      createQueryCompiler: (): PostgresQueryCompiler => new PostgresQueryCompiler(),
    } satisfies Dialect;
  }

  if (dialect === "sqlite") {
    return {
      createAdapter: (): SqliteAdapter => new SqliteAdapter(),
      createDriver: (): DummyDriver => new DummyDriver(),
      createIntrospector: (db: Kysely<unknown>): SqliteIntrospector => new SqliteIntrospector(db),
      createQueryCompiler: (): SqliteQueryCompiler => new SqliteQueryCompiler(),
    } satisfies Dialect;
  }

  assertExhaustive(dialect, `Dialect '${dialect}' not supported.`);
}

export function tableToSql(dialect: "sqlite" | "postgres", table: PgTableWithColumns<any>): string {
  const db = new Kysely({ dialect: getDialect(dialect) });
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
    query = query.addPrimaryKeyConstraint(`${tableName}__primaryKey`, primaryKeys as any);
  }

  const { sql } = query.compile();
  return sql;
}
