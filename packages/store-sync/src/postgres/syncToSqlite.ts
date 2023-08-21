import { StoreConfig } from "@latticexyz/store";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { SyncOptions, SyncResult } from "../common";
import { sqliteStorage } from "./postgresStorage";
import { createStoreSync } from "../createStoreSync";

type SyncToSqliteOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  /**
   * [SQLite database object from Drizzle][0].
   *
   * [0]: https://orm.drizzle.team/docs/installation-and-db-connection/sqlite/better-sqlite3
   */
  database: BaseSQLiteDatabase<"sync", any>;
  startSync?: boolean;
};

type SyncToSqliteResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig> & {
  stopSync: () => void;
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
  startBlock,
  maxBlockRange,
  indexerUrl,
  initialState,
  startSync = true,
}: SyncToSqliteOptions<TConfig>): Promise<SyncToSqliteResult<TConfig>> {
  const storeSync = await createStoreSync({
    storageAdapter: await sqliteStorage({ database, publicClient, config }),
    config,
    address,
    publicClient,
    startBlock,
    maxBlockRange,
    indexerUrl,
    initialState,
  });

  const sub = startSync ? storeSync.blockStorageOperations$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  return {
    ...storeSync,
    stopSync,
  };
}
