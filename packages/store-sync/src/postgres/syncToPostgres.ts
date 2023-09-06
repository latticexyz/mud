import { StoreConfig } from "@latticexyz/store";
import { PgDatabase } from "drizzle-orm/pg-core";
import { SyncOptions, SyncResult } from "../common";
import { postgresStorage } from "./postgresStorage";
import { createStoreSync } from "../createStoreSync";

type SyncToPostgresOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  /**
   * [Postgres database object from Drizzle][0].
   *
   * [0]: https://orm.drizzle.team/docs/installation-and-db-connection/postgresql/postgresjs
   */
  database: PgDatabase<any>;
  startSync?: boolean;
};

type SyncToPostgresResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig> & {
  stopSync: () => void;
};

/**
 * Creates an indexer to process and store blockchain events.
 *
 * @param {CreateIndexerOptions} options See `CreateIndexerOptions`.
 * @returns A function to unsubscribe from the block stream, effectively stopping the indexer.
 */
export async function syncToPostgres<TConfig extends StoreConfig = StoreConfig>({
  config,
  database,
  publicClient,
  address,
  startBlock,
  maxBlockRange,
  indexerUrl,
  initialState,
  startSync = true,
}: SyncToPostgresOptions<TConfig>): Promise<SyncToPostgresResult<TConfig>> {
  const storeSync = await createStoreSync({
    storageAdapter: await postgresStorage({ database, publicClient, config }),
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
