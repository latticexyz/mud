import { PgDatabase, pgSchema, varchar } from "drizzle-orm/pg-core";
import { debug as parentDebug } from "./debug";
import { sql } from "drizzle-orm";
import { pgDialect } from "./pgDialect";
import { isNotNull } from "@latticexyz/common/utils";

const debug = parentDebug.extend("cleanDatabase");

// Postgres internal table
const schemata = pgSchema("information_schema").table("schemata", {
  schemaName: varchar("schema_name", { length: 64 }),
});

function isMudSchemaName(schemaName: string): boolean {
  // address-prefixed schemas like {address}__{namespace} used by decoded postgres tables
  // optional prefix for schemas created in tests
  if (/(^|__)0x[0-9a-f]{40}__/i.test(schemaName)) {
    return true;
  }
  // schema for internal tables
  // optional prefix for schemas created in tests
  if (/(^|__)mud$/.test(schemaName)) {
    return true;
  }
  // old schema for internal tables
  // TODO: remove after a while
  if (/__mud_internal$/.test(schemaName)) {
    return true;
  }
  return false;
}

/**
 * VERY DESTRUCTIVE! Finds and drops all MUD indexer related schemas and tables.
 * @internal
 */
export async function cleanDatabase(db: PgDatabase<any>): Promise<void> {
  const schemaNames = (await db.select({ schemaName: schemata.schemaName }).from(schemata).execute())
    .map((row) => row.schemaName)
    .filter(isNotNull)
    .filter(isMudSchemaName);

  debug(`dropping ${schemaNames.length} schemas`);

  await db.transaction(async (tx) => {
    for (const schemaName of schemaNames) {
      debug(`dropping schema ${schemaName} and all of its tables`);
      await tx.execute(sql.raw(pgDialect.schema.dropSchema(schemaName).ifExists().cascade().compile().sql));
    }
  });
}
