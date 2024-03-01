import { DynamicPrimitiveType, StaticPrimitiveType } from "@latticexyz/schema-type";
import { ZustandStore } from "../zustand";
import { AllTables, Query } from "./common";
import { StoreConfig, Tables } from "@latticexyz/store";
import { groupBy } from "@latticexyz/common/utils";
import { encodeAbiParameters } from "viem";
import { matchesCondition } from "./matchesCondition";
import { findSubjects } from "./findSubjects";

type QueryResult<query extends Query> = {
  // TODO: resolve the actual types via config look up of query subjects
  readonly subjects: readonly (StaticPrimitiveType | DynamicPrimitiveType)[];
  // TODO: infer whether records should be here if records was provided in query
  // TODO: resolve record types from config and requested table records
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly records?: readonly Object[];
};

// TODO: validate query
//       - one subject per table
//       - underlying subject field types match
//       - only keys as subjects for now?
//       - subjects and conditions all have valid fields
//       - can only compare like types?
//       - `where` tables are in `from`

// TODO: make query smarter/config aware for shorthand
// TODO: make condition types smarter, so condition literal matches the field primitive type

export async function query<config extends StoreConfig, extraTables extends Tables | undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: Query
): Promise<QueryResult<typeof query>> {
  return findSubjects({ records: Object.values(store.getState().records), query });
}
