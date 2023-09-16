import { AnyPgColumn, PgTableWithColumns, PgDatabase, getTableConfig } from "drizzle-orm/pg-core";
import { getTableColumns, sql } from "drizzle-orm";
import { ColumnDataType } from "kysely";
import { isDefined } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { pgDialect } from "./pgDialect";

export async function setupTables(
  db: PgDatabase<any>,
  tables: PgTableWithColumns<any>[]
): Promise<() => Promise<void>> {
  // TODO: add table to internal tables here
  // TODO: look up table schema and check if it matches expected schema, drop if not

  const schemaNames = [...new Set(tables.map((table) => getTableConfig(table).schema).filter(isDefined))];

  await db.transaction(async (tx) => {
    for (const schemaName of schemaNames) {
      debug(`creating namespace ${schemaName}`);
      await tx.execute(sql.raw(pgDialect.schema.createSchema(schemaName).ifNotExists().compile().sql));
    }

    for (const table of tables) {
      const tableConfig = getTableConfig(table);
      const scopedDb = tableConfig.schema ? pgDialect.withSchema(tableConfig.schema) : pgDialect;

      let query = scopedDb.schema.createTable(tableConfig.name).ifNotExists();

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
        query = query.addPrimaryKeyConstraint(`${tableConfig.name}__pk`, primaryKeys as any);
      }

      debug(`creating table ${tableConfig.name} in namespace ${tableConfig.schema}`);
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
