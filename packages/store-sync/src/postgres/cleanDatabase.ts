import { PgDatabase } from "drizzle-orm/pg-core";
import { buildInternalTables } from "./buildInternalTables";
import { getTables } from "./getTables";
import { buildTable } from "./buildTable";
import { getSchema } from "./getSchema";
import { isDefined } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { getTableName, sql } from "drizzle-orm";
import { pgDialect } from "./pgDialect";

// This intentionally just cleans up known schemas/tables/rows. We could drop the database but that's scary.

export async function cleanDatabase(db: PgDatabase<any>): Promise<void> {
  const internalTables = buildInternalTables();
  // TODO: check if internalTables schema matches, delete if not

  const tables = (await getTables(db)).map(buildTable);

  const schemaNames = [...new Set(tables.map(getSchema))].filter(isDefined);

  for (const schemaName of schemaNames) {
    try {
      debug(`dropping namespace ${schemaName} and all of its tables`);
      await db.execute(sql.raw(pgDialect.schema.dropSchema(schemaName).ifExists().cascade().compile().sql));
    } catch (error) {
      debug(`failed to drop namespace ${schemaName}`, error);
    }
  }

  for (const internalTable of Object.values(internalTables)) {
    debug(`deleting all rows from ${getSchema(internalTable)}.${getTableName(internalTable)}`);
    await db.delete(internalTable);
  }
}
