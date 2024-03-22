import { AnyPgColumn, PgTableWithColumns, PgDatabase, getTableConfig } from "drizzle-orm/pg-core";
import { getTableColumns, sql } from "drizzle-orm";
import { ColumnDataType } from "kysely";
import { isDefined, unique } from "@latticexyz/common/utils";
import { debug as parentDebug } from "./debug";
import { pgDialect } from "./pgDialect";

const debug = parentDebug.extend("setupTables");
const error = parentDebug.extend("setupTables");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);

export async function setupTables(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tables: PgTableWithColumns<any>[],
): Promise<() => Promise<void>> {
  const schemaNames = unique(tables.map((table) => getTableConfig(table).schema).filter(isDefined));

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

      const primaryKeyColumns = columns.filter((column) => column.primary).map((column) => column.name);
      if (primaryKeyColumns.length) {
        query = query.addPrimaryKeyConstraint(
          `${tableConfig.name}_${primaryKeyColumns.join("_")}_pk`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          primaryKeyColumns as any,
        );
      }

      for (const pk of tableConfig.primaryKeys) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query = query.addPrimaryKeyConstraint(pk.getName(), pk.columns.map((col) => col.name) as any);
      }

      debug(`creating table ${tableConfig.name} in namespace ${tableConfig.schema}`);
      await tx.execute(sql.raw(query.compile().sql));

      for (const index of tableConfig.indexes) {
        const columnNames = index.config.columns.map((col) => col.name);
        let query = scopedDb.schema
          .createIndex(index.config.name ?? `${tableConfig.name}_${columnNames.join("_")}_index`)
          .on(tableConfig.name)
          .columns(columnNames)
          .ifNotExists();
        if (index.config.unique) {
          query = query.unique();
        }
        await tx.execute(sql.raw(query.compile().sql));
      }
    }
  });

  return async () => {
    for (const schemaName of schemaNames) {
      try {
        debug(`dropping namespace ${schemaName} and all of its tables`);
        await db.execute(sql.raw(pgDialect.schema.dropSchema(schemaName).ifExists().cascade().compile().sql));
      } catch (e) {
        error(`failed to drop namespace ${schemaName}`, e);
      }
    }
  };
}
