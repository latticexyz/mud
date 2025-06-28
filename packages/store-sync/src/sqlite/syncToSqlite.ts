import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { SyncOptions, SyncResult } from "../common";
import { sqliteStorage } from "./sqliteStorage";
import { createStoreSync } from "../createStoreSync";

export type SyncToSqliteOptions = SyncOptions & {
  /**
   * [SQLite database object from Drizzle][0].
   *
   * [0]: https://orm.drizzle.team/docs/installation-and-db-connection/sqlite/better-sqlite3
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database: BaseSQLiteDatabase<"sync", any>;
  startSync?: boolean;
};

export type SyncToSqliteResult = SyncResult & {
  stopSync: () => void;
};

/**
 * Creates an indexer to process and store blockchain events.
 *
 * @param {SyncToSqliteOptions} options See `SyncToSqliteOptions`.
 * @returns A function to unsubscribe from the block stream, effectively stopping the indexer.
 */
export async function syncToSqlite({
  database,
  startSync = true,
  ...opts
}: SyncToSqliteOptions): Promise<SyncToSqliteResult> {
  const storeSync = await createStoreSync({
    ...opts,
    storageAdapter: await sqliteStorage({ ...opts, database }),
  });

  const sub = startSync ? storeSync.storedBlockLogs$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  return {
    ...storeSync,
    stopSync,
  };
}
