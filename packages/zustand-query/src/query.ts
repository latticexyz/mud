import { Key } from "./createStore";
import { QueryFragment } from "./queryFragments";

// TODO: maybe add option to include records in the result?
type Keys = { [encodedKey: string]: Key };
export type QueryResult = { keys: Keys };

type QueryOptions = {
  initialKeys?: Keys;
};

export function runQuery(query: [QueryFragment, ...QueryFragment[]], options?: QueryOptions): QueryResult {
  const result = { keys: options?.initialKeys ?? query[0].table.getKeys()};

  for()

  return result;
}
