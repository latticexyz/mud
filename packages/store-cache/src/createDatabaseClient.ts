import { TupleDatabase, TupleDatabaseClient } from "tuple-database";
import { DatabaseClient, Key, SetOptions, SubscriptionCallback, SubscriptionFilterOptions, Value } from "./types";
import { set, get, remove, getDefaultValue, subscribe } from "./utils";
import { StoreConfig } from "@latticexyz/store";
import { curry } from "@latticexyz/common/utils";

/**
 * Create a typed database client from a tuple database and a store config
 */
export function createDatabaseClient<C extends StoreConfig>(database: TupleDatabase, config: C) {
  const _tupleDatabaseClient = new TupleDatabaseClient(database);
  const { namespace } = config;
  const tables: Record<string, unknown> = {};

  // Create utils with client argument prefilled
  const utilsWithClient = {
    set: curry(set<C>, _tupleDatabaseClient),
    get: curry(get<C>, _tupleDatabaseClient),
    remove: curry(remove<C>, _tupleDatabaseClient),
    subscribe: curry(subscribe<C>, _tupleDatabaseClient),
  };

  // Create utils with client, namespace and table argument prefilled
  for (const table in config.tables) {
    tables[table] = {
      set: (key: Key<C, typeof table>, value: Value<C, typeof table>, options: SetOptions) =>
        utilsWithClient.set(namespace, table, key, value, {
          defaultValue: getDefaultValue(config.tables?.[table].schema),
          ...options,
        }),
      get: curry(utilsWithClient.get, namespace, table),
      remove: curry(utilsWithClient.remove, namespace, table),
      subscribe: (
        callback: SubscriptionCallback<C, typeof table>,
        filter?: Omit<SubscriptionFilterOptions<C, typeof table>, "table">
      ) => subscribe(_tupleDatabaseClient, callback, { namespace, table, ...filter }),
    };
  }

  return { tables, _tupleDatabaseClient, ...utilsWithClient } as DatabaseClient<C>;
}
