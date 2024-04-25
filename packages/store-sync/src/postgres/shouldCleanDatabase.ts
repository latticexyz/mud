import { PgDatabase } from "drizzle-orm/pg-core";
import { tables } from "./tables";
import { debug as parentDebug } from "./debug";
import { version as expectedVersion } from "./version";

const debug = parentDebug.extend("shouldCleanDatabase");
const error = parentDebug.extend("shouldCleanDatabase");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);

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
  } catch (e) {
    error(e);
    debug("error while querying config table");
    return true;
  }
}
