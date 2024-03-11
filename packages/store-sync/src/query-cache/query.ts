import { ZustandStore } from "../zustand";
import { AllTables, Query, QueryResultSubject } from "./common";
import { StoreConfig, Tables } from "@latticexyz/store";
import { findSubjects } from "./findSubjects";

// TODO: validate query
//       - one subject per table
//       - underlying subject field types match
//       - only keys as subjects for now?
//       - subjects and conditions all have valid fields
//       - can only compare like types?
//       - `where` tables are in `from`

// TODO: make query smarter/config aware for shorthand
// TODO: make condition types smarter, so condition literal matches the field primitive type

type QueryResult<query extends Query> = readonly QueryResultSubject[];

export async function query<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: Query,
): Promise<QueryResult<typeof query>> {
  const records = Object.values(store.getState().records);
  const matches = findSubjects({ records, query });

  return matches;
}
