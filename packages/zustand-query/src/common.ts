import { Keys } from "./createStore";
import { QueryFragment } from "./queryFragments";

// TODO: maybe add option to include records in the result?
export type CommonQueryResult = { keys: Keys };

export type CommonQueryOptions = {
  initialKeys?: Keys;
};

export type Query = [QueryFragment, ...QueryFragment[]];
