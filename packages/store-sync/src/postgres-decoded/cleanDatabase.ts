import { PgDatabase, getTableConfig } from "drizzle-orm/pg-core";
import { getTables } from "./getTables";
import { buildTable } from "./buildTable";
import { isDefined, unique } from "@latticexyz/common/utils";
import { debug } from "./debug";
import { sql } from "drizzle-orm";
import { pgDialect } from "../postgres/pgDialect";
import { cleanDatabase as cleanBytesDatabase } from "../postgres/cleanDatabase";

// This intentionally just cleans up known schemas/tables. We could drop the database but that's scary.

export async function cleanDatabase(db: PgDatabase<any>): Promise<void> {
  const sqlTables = (await getTables(db)).map(buildTable);

  const schemaNames = unique(sqlTables.map((sqlTable) => getTableConfig(sqlTable).schema).filter(isDefined));

  for (const schemaName of schemaNames) {
    try {
      debug(`dropping namespace ${schemaName} and all of its tables`);
      await db.execute(sql.raw(pgDialect.schema.dropSchema(schemaName).ifExists().cascade().compile().sql));
    } catch (error) {
      debug(`failed to drop namespace ${schemaName}`, error);
    }
  }

  await cleanBytesDatabase(db);
}
