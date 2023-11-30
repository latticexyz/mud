import { PgDatabase } from "drizzle-orm/pg-core";
import { tables } from "./tables";
import { debug as parentDebug } from "./debug";
import { version as expectedVersion } from "./version";

const debug = parentDebug.extend("shouldCleanDatabase");

/**
 * @internal
 */
export async function shouldCleanDatabase(db: PgDatabase<any>): Promise<boolean> {
  try {
    const currentVersion = (
      await db.select({ version: tables.configTable.version }).from(tables.configTable).limit(1).execute()
    )
      .map((row) => row.version)
      .find(() => true);

    if (currentVersion == null) {
      debug("no record found in config table");
      return true;
    }

    if (currentVersion !== expectedVersion) {
      debug(`current version (${currentVersion}) did not match expected version (${expectedVersion})`);
      return true;
    }

    debug("database shape appears to be up to date");
    return false;
  } catch (error) {
    console.error(error);
    debug("error while querying config table");
    return true;
  }
}
