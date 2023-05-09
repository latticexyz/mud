import { TupleDatabase, TupleDatabaseClient } from "tuple-database";
import {
  DatabaseClient,
  Key,
  RemoveOptions,
  SetOptions,
  SubscriptionCallback,
  SubscriptionFilterOptions,
  Value,
} from "./types";
import { set, get, remove, getDefaultValue, subscribe } from "./utils";
import { StoreConfig } from "@latticexyz/store";

/**
 * Create a typed database client from a tuple database and a store config
 */
export function createDatabaseClient<C extends StoreConfig>(database: TupleDatabase, config: C) {
  const _tupleDatabaseClient = new TupleDatabaseClient(database);
  const client: Record<string, unknown> = { _tupleDatabaseClient };

  for (const table in config.tables) {
    client[table] = {
      set: (key: Key<C, typeof table>, value: Value<C, typeof table>, options: SetOptions) =>
        set(_tupleDatabaseClient, table, key, value, {
          defaultValue: getDefaultValue(config.tables?.[table].schema),
          ...options,
        }),
      get: (key: Key<C, typeof table>) => get(_tupleDatabaseClient, table, key),
      remove: (key: Key<C, typeof table>, options?: RemoveOptions) => remove(_tupleDatabaseClient, table, key, options),
      subscribe: (
        callback: SubscriptionCallback<C, typeof table>,
        filter?: Omit<SubscriptionFilterOptions<C, typeof table>, "table">
      ) => subscribe(_tupleDatabaseClient, callback, { table, ...filter }),
    };
  }
  return client as DatabaseClient<C>;
}
