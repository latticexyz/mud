import { getKeySchema } from "@latticexyz/protocol-parser/internal";
import {
  StoreRecords,
  Query,
  Store,
  MutableStoreRecords,
  CommonQueryOptions,
  CommonQueryResult,
  getQueryConfig,
} from "../common";
import { getConfig } from "./getConfig";
import { getRecords } from "./getRecords";

type RunQueryOptions = CommonQueryOptions & {
  includeRecords?: boolean;
};

// TODO: is it feasible to type the store records return type based on the query?
export type RunQueryArgs = {
  store: Store;
  query: Query;
  options?: RunQueryOptions;
};

export type RunQueryResult<args extends RunQueryArgs = RunQueryArgs> = CommonQueryResult &
  (args["options"] extends {
    includeRecords: true;
  }
    ? {
        records: StoreRecords<getQueryConfig<args["query"]>>;
      }
    : {});

export function runQuery<args extends RunQueryArgs>({ store, query, options }: args): RunQueryResult<args> {
  // Only allow fragments with matching table keys for now
  // TODO: we might be able to enable this if we add something like a `keySelector`
  const expectedKeySchema = getKeySchema(getConfig({ store, table: query[0].table }));
  for (const fragment of query) {
    if (
      Object.values(expectedKeySchema).join("|") !==
      Object.values(getKeySchema(getConfig({ store, table: fragment.table }))).join("|")
    ) {
      throw new Error(
        "All tables in a query must share the same key schema. Found mismatch when comparing tables: " +
          fragment.table.label +
          " and " +
          query[0].table.label,
      );
    }
  }

  // Initial set of matching keys is either the provided `initialKeys` or all keys of the table of the first fragment
  const keys = options?.initialKeys ?? query[0].getInitialKeys(store);

  for (const fragment of query) {
    // TODO: this might be more efficient if we would use a Map() instead of an object
    for (const encodedKey of Object.keys(keys)) {
      if (!fragment.match(store, encodedKey)) {
        delete keys[encodedKey];
      }
    }
  }

  // Early return if records are not requested
  if (!options?.includeRecords) {
    return { keys };
  }

  const records: MutableStoreRecords = {};
  for (const { table } of query) {
    const { namespaceLabel, label } = table;
    records[namespaceLabel] ??= {};
    const tableRecords = getRecords({ store, table, keys: Object.values(keys) });
    records[namespaceLabel][label] ??= tableRecords;
  }
  return { keys, records };
}
