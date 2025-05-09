import { Table } from "@latticexyz/config";
import {
  TableUpdates,
  Keys,
  Unsubscribe,
  Query,
  Stash,
  CommonQueryOptions,
  CommonQueryResult,
  StoreConfig,
  getNamespaces,
  getNamespaceTables,
  getConfig,
  getQueryConfig,
  getAllTables,
  Key,
  TableRecord,
} from "../common";
import { runQuery } from "./runQuery";
import { encodeKey } from "./encodeKey";
import { subscribeStash } from "./subscribeStash";

export type SubscribeQueryOptions = CommonQueryOptions;

export type QueryTableUpdates<config extends StoreConfig = StoreConfig> = {
  [namespace in getNamespaces<config>]: {
    [table in getNamespaceTables<config, namespace>]: TableUpdates<getConfig<config, namespace, table>>;
  };
};

export type QueryUpdateType = "enter" | "update" | "exit";
export type QueryUpdate<table extends Table = Table> = {
  key: Key<table>;
  type: QueryUpdateType;
  table?: table;
  previous?: TableRecord<table>;
  current?: TableRecord<table>;
};
export type QueryUpdates<table extends Table = Table> = QueryUpdate<table>[];

export type QuerySubscriber<config extends StoreConfig = StoreConfig> = (
  updates: QueryUpdates<getAllTables<config>>,
) => void;

export type SubscribeQueryArgs<query extends Query = Query> = {
  stash: Stash;
  query: query;
  subscriber?: QuerySubscriber<getQueryConfig<query>>;
  options?: SubscribeQueryOptions;
};

export type SubscribeQueryResult<query extends Query = Query> = CommonQueryResult & {
  /**
   * Subscribe to query updates.
   * Returns a function to unsubscribe the provided subscriber.
   */
  subscribe: (subscriber: QuerySubscriber<getQueryConfig<query>>) => Unsubscribe;
  /**
   * Unsubscribe the query from all table updates.
   * Note: this is different from unsubscribing a query subscriber.
   */
  unsubscribe: () => void;
};

export function subscribeQuery<query extends Query>({
  stash,
  query,
  subscriber,
  options,
}: SubscribeQueryArgs<query>): SubscribeQueryResult<query> {
  const initialRun = runQuery({
    stash,
    query,
    options: {
      // Pass the initial keys
      initialKeys: options?.initialKeys,
      includeRecords: false,
    },
  });
  const matching: Keys = initialRun?.keys ?? {};
  const subscribers = new Set<QuerySubscriber>(subscriber ? [subscriber as QuerySubscriber] : []);

  const subscribe = (subscriber: QuerySubscriber<getQueryConfig<query>>): Unsubscribe => {
    subscribers.add(subscriber as QuerySubscriber);
    return () => subscribers.delete(subscriber as QuerySubscriber);
  };

  const updateQueryResult = (tableUpdates: TableUpdates) => {
    const updates: QueryUpdates = [];

    for (const update of tableUpdates) {
      const encodedKey = encodeKey({ table: update.table, key: update.key });
      const matchedKey = matching[encodedKey];
      const { namespaceLabel, label } = update.table;
      if (matchedKey != null) {
        // If the key matched before, check if the relevant fragments (accessing this table) still match
        const relevantFragments = query.filter((f) => f.table.namespace === namespaceLabel && f.table.label === label);
        const match = relevantFragments.every((f) => f.pass(stash, encodedKey));
        if (match) {
          // If all relevant fragments still match, the key still matches the query.
          updates.push({ ...update, type: "update" });
        } else {
          // If one of the relevant fragments don't match anymore, the key doesn't pass the query anymore.
          delete matching[encodedKey];
          updates.push({ ...update, type: "exit" });
        }
      } else {
        // If this key didn't match the query before, check all fragments
        const match = query.every((f) => f.pass(stash, encodedKey));
        if (match) {
          // Since the key schema of query fragments has to match, we can pick any fragment to decode they key
          matching[encodedKey] = update.key;
          updates.push({ ...update, type: "enter" });
        }
      }
    }

    // Notify subscribers
    subscribers.forEach((subscriber) => subscriber(updates));
  };

  // Too maintain atomicity of stash updates we don't subscribe to tables individually but filter global stash updates.
  const relevantTables = new Set(query.map((fragment) => fragment.table.tableId));
  const unsubscribe = subscribeStash({
    stash,
    subscriber: (event) => {
      if (event.type !== "records") return;
      const relevantUpdates = event.updates.filter((update) => relevantTables.has(update.table.tableId));
      updateQueryResult(relevantUpdates);
    },
  });

  // Notify initial subscribers
  const updates: QueryUpdates = Object.values(matching).map((key) => ({ key, type: "enter" }));
  subscribers.forEach((subscriber) => subscriber(updates));

  return { keys: matching, subscribe, unsubscribe };
}
