import { TupleDatabase, TupleDatabaseClient } from "tuple-database";
import { DatabaseClient, Key, Value } from "./types";
import { set, get, remove, getDefaultValue } from "./utils";
import { StoreConfig } from "@latticexyz/store";

export function createDatabaseClient<C extends StoreConfig>(database: TupleDatabase, config: C) {
  const _tupleDatabaseClient = new TupleDatabaseClient(database);
  const client: Record<string, unknown> = { _tupleDatabaseClient };

  for (const table in config.tables) {
    client[table] = {
      set: (key: Key<C, typeof table>, value: Value<C, typeof table>) =>
        set(_tupleDatabaseClient, table, key, value, {
          defaultValue: getDefaultValue(config.tables?.[table].schema),
        }),
      get: (key: Key<C, typeof table>) => get(_tupleDatabaseClient, table, key),
      remove: (key: Key<C, typeof table>) => remove(_tupleDatabaseClient, table, key),
    };
  }
  return client as DatabaseClient<C>;
}
