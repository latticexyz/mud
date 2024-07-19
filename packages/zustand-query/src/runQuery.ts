import { Query, CommonQueryOptions, CommonQueryResult } from "./common";
import { getKeySchema } from "@latticexyz/protocol-parser/internal";

export function runQuery(query: Query, options?: CommonQueryOptions): CommonQueryResult {
  // Only allow fragments with matching table keys for now
  // TODO: we might be able to enable this if we add something like a `keySelector`
  // TODO: getKeySchema expects a full table as type, but only needs schema and key
  const expectedKeySchema = getKeySchema(query[0].table.getConfig() as never);
  for (const fragment of query) {
    if (JSON.stringify(expectedKeySchema) !== JSON.stringify(getKeySchema(fragment.table.getConfig() as never))) {
      console.log(expectedKeySchema, getKeySchema(fragment.table.getConfig() as never));
      throw new Error("All tables in a query must share the same key schema");
    }
  }

  // Initial set of matching keys is either the provided `initialKeys` or all keys of the table of the first fragment
  const matching = { keys: options?.initialKeys ?? query[0].getInitialKeys() };

  for (const fragment of query) {
    // TODO: this might be more efficient if we would use a Map() instead of an object
    for (const encodedKey of Object.keys(matching.keys)) {
      if (!fragment.filter(encodedKey)) {
        delete matching.keys[encodedKey];
      }
    }
  }

  return matching;
}
