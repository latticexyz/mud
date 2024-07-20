import { Query, CommonQueryOptions, CommonQueryResult, Unsubscribe, TableUpdates, TableLabel } from "./common";
import { Keys } from "./common";
import { runQuery } from "./runQuery";

type DefineQueryOptions = CommonQueryOptions & {
  // Skip the initial `runQuery` to initialize the query result.
  // Only updates after the query was defined are considered in the result.
  skipInitialRun?: boolean;
};

type QueryUpdate = {
  records: {
    [namespace: string]: {
      [table: string]: TableUpdates;
    };
  };
  keys: Keys;
  types: { [key: string]: "enter" | "update" | "exit" };
};

type QuerySubscriber = (update: QueryUpdate) => void;

type DefineQueryResult = CommonQueryResult & {
  /**
   * Subscribe to query updates.
   * Returns a function to unsubscribe the provided subscriber.
   */
  subscribe: (subscriber: QuerySubscriber) => Unsubscribe;
  /**
   * Unsubscribe the query from all table updates.
   * Note: this is different from unsubscribing a query subscriber.
   */
  unsubscribe: () => void;
};

export function defineQuery(query: Query, options?: DefineQueryOptions): DefineQueryResult {
  const matching: Keys = options?.skipInitialRun ? {} : runQuery(query, { initialKeys: options?.initialKeys }).keys;
  const subscribers = new Set<QuerySubscriber>();

  const subscribe = (subscriber: QuerySubscriber): Unsubscribe => {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  };

  const updateQueryResult = ({ namespace, label }: TableLabel, tableUpdates: TableUpdates) => {
    const update: QueryUpdate = {
      records: { [namespace ?? ""]: { [label]: tableUpdates } },
      keys: {},
      types: {},
    };

    for (const key of Object.keys(tableUpdates)) {
      if (key in matching) {
        update.keys[key] = matching[key];
        // If the key matched before, check if the relevant fragments (accessing this table) still match
        const relevantFragments = query.filter(
          (f) => f.table.tableLabel.namespace === namespace && f.table.tableLabel.label === label,
        );
        const match = relevantFragments.every((f) => f.filter(key));
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
        const match = query.every((f) => f.filter(key));
        if (match) {
          // Since the key schema of query fragments has to match, we can pick any fragment to decode they key
          const decodedKey = query[0].table.decodeKey({ encodedKey: key });
          matching[key] = decodedKey;
          update.keys[key] = decodedKey;
          update.types[key] = "enter";
        }
      }
    }

    // Notify subscribers
    subscribers.forEach((subscriber) => subscriber(update));
  };

  // Subscribe to each table's update stream and store the unsubscribers
  const unsubsribers = query.map((fragment) =>
    fragment.table.subscribe({ subscriber: (updates) => updateQueryResult(fragment.table.tableLabel, updates) }),
  );

  const unsubscribe = () => unsubsribers.forEach((unsub) => unsub());

  return { keys: matching, subscribe, unsubscribe };
}
