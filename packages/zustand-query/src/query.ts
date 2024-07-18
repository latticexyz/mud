import { Keys } from "./createStore";
import { QueryFragment } from "./queryFragments";

// TODO: maybe add option to include records in the result?
export type QueryResult = { keys: Keys };

type QueryOptions = {
  initialKeys?: Keys;
};

export function runQuery(query: [QueryFragment, ...QueryFragment[]], options?: QueryOptions): QueryResult {
  // Initial set of matching keys is either the provided `initialKeys` or all keys of the table of the first fragment
  const matching = { keys: options?.initialKeys ?? query[0].table.getKeys() };

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
