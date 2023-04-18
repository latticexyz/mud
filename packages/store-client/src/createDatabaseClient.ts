import { StoreConfigShorthand } from "@latticexyz/config";
import { TupleDatabase, TupleDatabaseClient } from "tuple-database";
import { ClientTables, DatabaseClient } from "./types";
import { upsert, get, remove, getDefaultValue } from "./utils";

export function createDatabaseClient<Config extends StoreConfigShorthand>(database: TupleDatabase, config: Config) {
  const _tupleDatabaseClient = new TupleDatabaseClient(database);
  const client: Record<string, unknown> = { _tupleDatabaseClient };

  for (const table in config.tables) {
    client[table] = {
      upsert: (
        key: ClientTables<Config>[typeof table]["primaryKeys"],
        value: Partial<ClientTables<Config>[typeof table]["schema"]>
      ) =>
        upsert(_tupleDatabaseClient, table, key, value, {
          defaultValue: getDefaultValue(config.tables?.[table].schema),
        }),
      get: (key: ClientTables<Config>[typeof table]["primaryKeys"]) => get(_tupleDatabaseClient, table, key),
      remove: (key: ClientTables<Config>[typeof table]["primaryKeys"]) => remove(_tupleDatabaseClient, table, key),
    };
  }
  return client as DatabaseClient<Config>;
}
