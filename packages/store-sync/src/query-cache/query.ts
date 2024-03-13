import { Query, QueryResult } from "./common";
import { findSubjects } from "./findSubjects";
import { ResolvedStoreConfig } from "@latticexyz/store/config/v2";
import { evaluate } from "@latticexyz/common/type-utils";
import { QueryCacheStore } from "./createStore";

// TODO: validate query
//       - one subject per table
//       - underlying subject field types match
//       - only keys as subjects for now?
//       - subjects and conditions all have valid fields
//       - all subjects match
//       - can only compare like types?
//       - `where` tables are in `from`

// TODO: return matching records alongside subjects? because the record subset may be smaller than what querying for records with matching subjects

export async function query<config extends ResolvedStoreConfig, query extends Query<config>>(
  store: QueryCacheStore<config["tables"][string]>,
  query: query,
): Promise<evaluate<QueryResult<query, config>>> {
  // TODO: validate that all query subjects match in underlying abi types
  // TODO: do other validations

  // TODO: transform query from TS shorthand to API version
  const subjects = findSubjects({ records: store.getState().records, query });

  return { subjects };
}
