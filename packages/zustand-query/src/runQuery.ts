import { Query, CommonQueryOptions, CommonQueryResult, StoreRecords } from "./common";
import { getKeySchema } from "@latticexyz/protocol-parser/internal";

type RunQueryOptions = CommonQueryOptions & {
  includeRecords?: boolean;
};

type RunQueryResult = CommonQueryResult & {
  // TODO: make records return type dependent on `includeRecords` on input type
  records?: StoreRecords;
};

export function runQuery(query: Query, options?: RunQueryOptions): RunQueryResult {
  // Only allow fragments with matching table keys for now
  // TODO: we might be able to enable this if we add something like a `keySelector`
  // TODO: getKeySchema expects a full table as type, but only needs schema and key
  const expectedKeySchema = getKeySchema(query[0].table.getConfig() as never);
  for (const fragment of query) {
    if (
      Object.values(expectedKeySchema).join("|") !== Object.values(getKeySchema(fragment.table.getConfig())).join("|")
    ) {
      throw new Error("All tables in a query must share the same key schema");
    }
  }

  // Initial set of matching keys is either the provided `initialKeys` or all keys of the table of the first fragment
  const keys = options?.initialKeys ?? query[0].getInitialKeys();

  for (const fragment of query) {
    // TODO: this might be more efficient if we would use a Map() instead of an object
    for (const encodedKey of Object.keys(keys)) {
      if (!fragment.filter(encodedKey)) {
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
    const namespace = table.tableLabel.namespace ?? "";
    const label = table.tableLabel.label;
    records[namespace] ??= {};
    const tableRecords = table.getRecords({ keys: Object.values(keys) });
    records[namespace][label] ??= tableRecords;
  }
  return { keys, records };
}
