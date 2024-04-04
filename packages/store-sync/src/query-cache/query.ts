import { Query } from "./common";
import { QueryCacheStore, extractTables } from "./createStore";
import { SubjectRecords } from "@latticexyz/query";
import { findSubjects } from "@latticexyz/query/internal";
import { queryToWire } from "./queryToWire";

// TODO: take in query input type so we can narrow result types

export type QueryResult = {
  subjects: readonly SubjectRecords[];
};

export async function query<store extends QueryCacheStore, query extends Query<extractTables<store>>>(
  store: store,
  query: query,
): Promise<QueryResult> {
  const { tables, records } = store.getState();

  const subjects = findSubjects({
    records,
    query: queryToWire(tables, query),
  });

  return {
    subjects,
  };
}
