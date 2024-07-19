import { Query, CommonQueryOptions, CommonQueryResult } from "./common";

type DefineQueryOptions = CommonQueryOptions & {
  // Skip the initial `runQuery` to initialize the query result.
  // Only updates after the query was defined are considered in the result.
  skipInitialRun?: boolean;
};

type QueryUpdate = {
  // Per table
  // Updated keys and their new values
  // TODO: need to somehow get these updates from the tables.
  // Maybe it does need a custom stream after all instead of the default zustand subscribers?
  // Don't think we can get individual key updates from zustand, it would only give us the whole table
};

type DefineQueryResult = CommonQueryResult & {};

export function defineQuery(query: Query, options?: CommonQueryOptions) {
  // const matching =
}
