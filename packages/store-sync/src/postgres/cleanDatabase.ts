import { PgDatabase, getTableConfig } from "drizzle-orm/pg-core";
import { tables } from "./tables";
import { debug } from "./debug";
import { sql } from "drizzle-orm";
import { pgDialect } from "./pgDialect";
import { isDefined, unique } from "@latticexyz/common/utils";

// This intentionally just cleans up known schemas/tables/rows. We could drop the database but that's scary.

export async function cleanDatabase(db: PgDatabase<any>): Promise<void> {
  const schemaNames = unique(
    Object.values(tables)
      .map((table) => getTableConfig(table).schema)
      .filter(isDefined)
  );

  await db.transaction(async (tx) => {
    for (const schemaName of schemaNames) {
      debug(`dropping schema ${schemaName} and all of its tables`);
      await tx.execute(sql.raw(pgDialect.schema.dropSchema(schemaName).ifExists().cascade().compile().sql));
    }
  });
}
