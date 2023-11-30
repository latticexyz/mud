import { PgDatabase } from "drizzle-orm/pg-core";
import { tables } from "./tables";
import { debug as parentDebug } from "./debug";
import { version as expectedVersion } from "./version";

const debug = parentDebug.extend("shouldCleanDatabase");

/**
 * @internal
 */
export async function shouldCleanDatabase(db: PgDatabase<any>, expectedChainId: number): Promise<boolean> {
  try {
    const config = (await db.select().from(tables.configTable).limit(1).execute()).find(() => true);

    if (!config) {
      debug("no record found in config table");
      return true;
    }

    if (config.version !== expectedVersion) {
      debug(`configured version (${config.version}) did not match expected version (${expectedVersion})`);
      return true;
    }

    if (config.chainId !== expectedChainId) {
      debug(`configured chain ID (${config.chainId}) did not match expected chain ID (${expectedChainId})`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(error);
    debug("error while querying config table");
    return true;
  }
}
