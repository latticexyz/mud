import { TupleDatabase, TupleDatabaseClient } from "tuple-database";
import { DatabaseClient, ExpandedConfig } from "./types";
import { set, get, remove, getDefaultValue } from "./utils";

export function createDatabaseClient<C extends ExpandedConfig>(database: TupleDatabase, config: C) {
  const _tupleDatabaseClient = new TupleDatabaseClient(database);
  const client: Record<string, unknown> = { _tupleDatabaseClient };

  for (const table in config.tables) {
    client[table] = {
      upsert: (key: C["tables"][typeof table]["primaryKeys"], value: C["tables"][typeof table]["schema"]) =>
        set(_tupleDatabaseClient, table, key, value, {
          defaultValue: getDefaultValue(config.tables?.[table].schema),
        }),
      get: (key: C["tables"][typeof table]["primaryKeys"]) => get(_tupleDatabaseClient, table, key),
      remove: (key: C["tables"][typeof table]["primaryKeys"]) => remove(_tupleDatabaseClient, table, key),
    };
  }
  return client as DatabaseClient<C>;
}
