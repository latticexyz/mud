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
  getTableConfig,
  getQueryConfig,
} from "../common";
import { decodeKey } from "./decodeKey";
import { getTable } from "./getTable";
import { runQuery } from "./runQuery";

export type SubscribeQueryOptions<config extends StoreConfig = StoreConfig> = CommonQueryOptions & {
  // Skip the initial `runQuery` to initialize the query result.
  // Only updates after the query was defined are considered in the result.
  skipInitialRun?: boolean;
  initialSubscribers?: QuerySubscriber<config>[];
};

// TODO: is it feasible to type the table updates based on the query?
type QueryTableUpdates<config extends StoreConfig = StoreConfig> = {
  [namespace in getNamespaces<config>]: {
    [table in getNamespaceTables<config, namespace>]: TableUpdates<getTableConfig<config, namespace, table>>;
  };
};

export type QueryUpdate<config extends StoreConfig = StoreConfig> = {
  records: QueryTableUpdates<config>;
  keys: Keys;
  types: { [key: string]: "enter" | "update" | "exit" };
};

type QuerySubscriber<config extends StoreConfig = StoreConfig> = (update: QueryUpdate<config>) => void;

export type SubscribeQueryArgs<query extends Query = Query> = {
  stash: Stash;
  query: query;
  options?: SubscribeQueryOptions<getQueryConfig<query>>;
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
  options,
}: SubscribeQueryArgs<query>): SubscribeQueryResult<query> {
  const initialRun = options?.skipInitialRun
    ? undefined
    : runQuery({
        stash,
        query,
        options: {
          // Pass the initial keys
          initialKeys: options?.initialKeys,
          // Request initial records if there are initial subscribers
          includeRecords: options?.initialSubscribers && options.initialSubscribers.length > 0,
        },
      });
  const matching: Keys = initialRun?.keys ?? {};
  const subscribers = new Set<QuerySubscriber>(options?.initialSubscribers as QuerySubscriber[]);

  const subscribe = (subscriber: QuerySubscriber<getQueryConfig<query>>): Unsubscribe => {
    subscribers.add(subscriber as QuerySubscriber);
    return () => subscribers.delete(subscriber as QuerySubscriber);
  };

  const updateQueryResult = ({ namespaceLabel, label }: Table, tableUpdates: TableUpdates) => {
    const update: QueryUpdate = {
      records: { [namespaceLabel]: { [label]: tableUpdates } },
      keys: {},
      types: {},
    };

    for (const key of Object.keys(tableUpdates)) {
      if (key in matching) {
        update.keys[key] = matching[key];
        // If the key matched before, check if the relevant fragments (accessing this table) still match
        const relevantFragments = query.filter((f) => f.table.namespace === namespaceLabel && f.table.label === label);
        const match = relevantFragments.every((f) => f.match(stash, key));
        if (match) {
          // If all relevant fragments still match, the key still matches the query.
          update.types[key] = "update";
        } else {
          // If one of the relevant fragments don't match anymore, the key doesn't pass the query anymore.
          delete matching[key];
          update.types[key] = "exit";
        }
      } else {
        // If this key didn't match the query before, check all fragments
        const match = query.every((f) => f.match(stash, key));
        if (match) {
          // Since the key schema of query fragments has to match, we can pick any fragment to decode they key
          const decodedKey = decodeKey({ stash, table: query[0].table, encodedKey: key });
          matching[key] = decodedKey;
          update.keys[key] = decodedKey;
          update.types[key] = "enter";
        }
      }
    }

    // Notify subscribers
    subscribers.forEach((subscriber) => subscriber(update));
  };

  // Subscribe to each table's update stream and stash the unsubscribers
  const unsubsribers = query.map((fragment) =>
    getTable({ stash, table: fragment.table }).subscribe({
      subscriber: (updates) => updateQueryResult(fragment.table, updates),
    }),
  );

  const unsubscribe = () => unsubsribers.forEach((unsub) => unsub());

  // TODO: find a more elegant way to do this
  if (subscribers.size > 0 && initialRun?.records) {
    // Convert records from the initial run to TableUpdate format
    const records: QueryTableUpdates = {};
    for (const namespace of Object.keys(initialRun.records)) {
      for (const table of Object.keys(initialRun.records[namespace])) {
        records[namespace] ??= {};
        records[namespace][table] = Object.fromEntries(
          Object.entries(initialRun.records[namespace][table]).map(([key, record]) => [
            key,
            { prev: undefined, current: record },
          ]),
        ) as never;
      }
    }

    // Convert keys to types format
    const types = Object.fromEntries(Object.keys(matching).map((key) => [key, "enter" as const]));

    // Notify initial subscribers
    subscribers.forEach((subscriber) => subscriber({ keys: matching, records, types }));
  }

  return { keys: matching, subscribe, unsubscribe };
}
