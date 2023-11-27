import { PgDatabase } from "drizzle-orm/pg-core";
import { schemaName } from "./tables";
import { debug } from "./debug";
import { sql } from "drizzle-orm";
import { pgDialect } from "./pgDialect";

// This intentionally just cleans up known schemas/tables/rows. We could drop the database but that's scary.

export async function cleanDatabase(db: PgDatabase<any>): Promise<void> {
  debug(`dropping schema ${schemaName} and all of its tables`);
  await db.execute(sql.raw(pgDialect.schema.dropSchema(schemaName).ifExists().cascade().compile().sql));
}
