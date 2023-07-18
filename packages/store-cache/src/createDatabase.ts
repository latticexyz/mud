import { InMemoryTupleStorage, AsyncTupleStorageApi, AsyncTupleDatabase } from "tuple-database";

export type CreateDatabaseOptions = {
  storage?: AsyncTupleStorageApi | undefined;
};

/**
 * Create a new in-memory tuple database
 */
export function createDatabase(opts: CreateDatabaseOptions = {}): AsyncTupleDatabase {
  const storage = opts.storage ?? new InMemoryTupleStorage();
  return new AsyncTupleDatabase(storage);
}
