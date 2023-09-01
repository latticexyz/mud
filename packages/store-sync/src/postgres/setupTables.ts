import { AnyPgColumn, PgTableWithColumns, PgDatabase } from "drizzle-orm/pg-core";
import { getTableColumns, getTableName, sql } from "drizzle-orm";
import { ColumnDataType } from "kysely";
import { getSchema } from "./getSchema";
import { isDefined } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { pgDialect } from "./pgDialect";

export async function setupTables(
  db: PgDatabase<any>,
  tables: PgTableWithColumns<any>[]
): Promise<() => Promise<void>> {
  // TODO: add table to internal tables here
  // TODO: look up table schema and check if it matches expected schema, drop if not

  const schemaNames = [...new Set(tables.map(getSchema).filter(isDefined))];

  await db.transaction(async (tx) => {
    for (const schemaName of schemaNames) {
      debug(`creating namespace ${schemaName}`);
      await tx.execute(sql.raw(pgDialect.schema.createSchema(schemaName).ifNotExists().compile().sql));
    }

    for (const table of tables) {
      const schemaName = getSchema(table);
      const scopedDb = schemaName ? pgDialect.withSchema(schemaName) : pgDialect;

      const tableName = getTableName(table);

      let query = scopedDb.schema.createTable(tableName).ifNotExists();

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

      debug(`creating table ${tableName} in namespace ${schemaName}`);
      await tx.execute(sql.raw(query.compile().sql));
    }
  });

  return async () => {
    for (const schemaName of schemaNames) {
      try {
        debug(`dropping namespace ${schemaName} and all of its tables`);
        await db.execute(sql.raw(pgDialect.schema.dropSchema(schemaName).ifExists().cascade().compile().sql));
      } catch (error) {
        debug(`failed to drop namespace ${schemaName}`, error);
      }
    }
  };
}
