import { Query, QueryResult, configTables, queryToResultSubject } from "./common";
import { ResolvedStoreConfig } from "@latticexyz/store/config/v2";
import { evaluate } from "@latticexyz/common/type-utils";
import { QueryCacheStore } from "./createStore";
import { findSubjects } from "@latticexyz/query";
import { queryToWire } from "./queryToWire";

// TODO: return matching records alongside subjects? because the record subset may be smaller than what querying for records with matching subjects

export async function query<config extends ResolvedStoreConfig, query extends Query<config>>(
  config: config,
  store: QueryCacheStore<configTables<config>>,
  query: query,
): Promise<evaluate<QueryResult<query, config>>> {
  const result = findSubjects({
    records: store.getState().records,
    query: queryToWire(config, query),
  });

  return {
    subjects: result.subjects as unknown as readonly queryToResultSubject<query, config>[],
  };
}
