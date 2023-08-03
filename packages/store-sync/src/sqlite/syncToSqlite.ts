import { StoreConfig } from "@latticexyz/store";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { SyncOptions, SyncResult } from "../common";
import { sqliteStorage } from "./sqliteStorage";
import { createStoreSync } from "../createStoreSync";

type SyncToSqliteOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  /**
   * [SQLite database object from Drizzle][0].
   *
   * [0]: https://orm.drizzle.team/docs/installation-and-db-connection/sqlite/better-sqlite3
   */
  database: BaseSQLiteDatabase<"sync", any>;
};

type SyncToSqliteResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig> & {
  destroy: () => void;
};

/**
 * Creates an indexer to process and store blockchain events.
 *
 * @param {CreateIndexerOptions} options See `CreateIndexerOptions`.
 * @returns A function to unsubscribe from the block stream, effectively stopping the indexer.
 */
export async function syncToSqlite<TConfig extends StoreConfig = StoreConfig>({
  config,
  database,
  publicClient,
  address,
  startBlock = 0n,
  maxBlockRange,
  indexerUrl,
  initialState,
}: SyncToSqliteOptions<TConfig>): Promise<SyncToSqliteResult<TConfig>> {
  const storeSync = await createStoreSync({
    storageAdapter: await sqliteStorage({ database, publicClient }),
    config,
    address,
    publicClient,
    startBlock,
    maxBlockRange,
    indexerUrl,
    initialState,
  });

  // Start the sync
  const sub = storeSync.blockStorageOperations$.subscribe();

  return {
    ...storeSync,
    destroy: (): void => {
      sub.unsubscribe();
    },
  };
}
