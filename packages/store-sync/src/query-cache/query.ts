import { Query, QueryResult } from "./common";
import { evaluate } from "@latticexyz/common/type-utils";
import { QueryCacheStore } from "./createStore";
import { findSubjects } from "@latticexyz/query";
import { queryToWire } from "./queryToWire";

// TODO: return matching records alongside subjects? because the record subset may be smaller than what querying for records with matching subjects

export async function query<store extends QueryCacheStore, query extends Query>(
  store: store,
  query: query,
): Promise<evaluate<QueryResult<query>>> {
  const { tables, records } = store.getState();

  const subjects = findSubjects({
    records,
    query: queryToWire(tables, query),
  });

  return {
    subjects: subjects as unknown as QueryResult<query>["subjects"],
  };
}
