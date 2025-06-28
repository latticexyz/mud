import { PgDatabase } from "drizzle-orm/pg-core";
import { SyncOptions, SyncResult } from "../common";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStoreSync } from "../createStoreSync";

export type SyncToPostgresOptions = SyncOptions & {
  /**
   * [Postgres database object from Drizzle][0].
   *
   * [0]: https://orm.drizzle.team/docs/installation-and-db-connection/postgresql/postgresjs
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database: PgDatabase<any>;
  startSync?: boolean;
};

export type SyncToPostgresResult = SyncResult & {
  stopSync: () => void;
};

/**
 * Creates an indexer to process and store blockchain events.
 *
 * @param {CreateIndexerOptions} options See `CreateIndexerOptions`.
 * @returns A function to unsubscribe from the block stream, effectively stopping the indexer.
 */
export async function syncToPostgres({
  database,
  startSync = true,
  ...opts
}: SyncToPostgresOptions): Promise<SyncToPostgresResult> {
  const { storageAdapter } = await createStorageAdapter({ ...opts, database });
  const storeSync = await createStoreSync({
    ...opts,
    storageAdapter,
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
