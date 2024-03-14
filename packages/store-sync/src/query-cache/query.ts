import { Query, QueryResult, Tables, queryToResultSubject } from "./common";
import { evaluate } from "@latticexyz/common/type-utils";
import { QueryCacheStore } from "./createStore";
import { findSubjects } from "@latticexyz/query";
import { queryToWire } from "./queryToWire";

// TODO: return matching records alongside subjects? because the record subset may be smaller than what querying for records with matching subjects

export async function query<
  store extends QueryCacheStore<tables>,
  query extends Query<tables>,
  tables extends Tables = store extends QueryCacheStore<infer tables> ? tables : Tables,
>(store: store, query: query): Promise<evaluate<QueryResult<query, tables>>> {
  const { tables, records } = store.getState();

  const result = findSubjects({
    records,
    query: queryToWire(tables, query),
  });

  return {
    subjects: result.subjects as unknown as readonly queryToResultSubject<query, tables>[],
  };
}
