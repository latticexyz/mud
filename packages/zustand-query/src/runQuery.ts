import { Query, CommonQueryOptions, CommonQueryResult, StoreRecords } from "./common";
import { getKeySchema } from "@latticexyz/protocol-parser/internal";
import { Store } from "./createStore";
import { getConfig, getRecords } from "./actions";

type RunQueryOptions = CommonQueryOptions & {
  includeRecords?: boolean;
};

type RunQueryResult = CommonQueryResult & {
  // TODO: make records return type dependent on `includeRecords` on input type
  records?: StoreRecords;
};

export function runQuery(store: Store, query: Query, options?: RunQueryOptions): RunQueryResult {
  // Only allow fragments with matching table keys for now
  // TODO: we might be able to enable this if we add something like a `keySelector`
  const expectedKeySchema = getKeySchema(getConfig(store, { table: query[0].table }));
  for (const fragment of query) {
    if (
      Object.values(expectedKeySchema).join("|") !==
      Object.values(getKeySchema(getConfig(store, { table: fragment.table }))).join("|")
    ) {
      throw new Error("All tables in a query must share the same key schema");
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

  const records: StoreRecords = {};
  for (const { table } of query) {
    const namespace = table.namespace ?? "";
    const label = table.label;
    records[namespace] ??= {};
    const tableRecords = getRecords(store, { table, keys: Object.values(keys) });
    records[namespace][label] ??= tableRecords;
  }
  return { keys, records };
}
