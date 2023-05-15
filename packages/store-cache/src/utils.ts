import { ScanArgs, Tuple, TupleDatabaseClient } from "tuple-database";
import { StoreConfig } from "@latticexyz/store";
import {
  Key,
  RemoveOptions,
  SchemaToPrimitives,
  SetOptions,
  SubscriptionCallback,
  SubscriptionFilterOptions,
  Update,
  Value,
} from "./types";
import { getAbiTypeDefaultValue } from "@latticexyz/schema-type";

/**
 * Set the value for the given key
 * @param client TupleDatabaseClient
 * @param table Table to set the given key in
 * @param key Key to identify the record to set in the table
 * @param value Value to set for the given key
 * @param options {
 *  transaction?: Append to an existing transaction, do not commit
 *  defaultValue?: Default value to use if the key does not exist
 * }
 * @returns Transaction
 */
export function set<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]>(
  client: TupleDatabaseClient,
  namespace: C["namespace"],
  table: T & string,
  key: Key<C, T>,
  value: Partial<Value<C, T>>,
  options?: SetOptions
) {
  const keyTuple = databaseKey<C, T>(namespace, table, key);
  const currentValue = client.get(keyTuple) ?? options?.defaultValue;
  const tx = options?.transaction ?? client.transact();
  tx.set(keyTuple, { ...currentValue, ...value });
  if (!options?.transaction) tx.commit();
  return tx;
}

/**
 * Get the value for the given key
 * @param client TupleDatabaseClient
 * @param table Table to get the given key from
 * @param key Key to identify the record to get from the table
 * @returns Value for the given key
 */
export function get<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]>(
  client: TupleDatabaseClient,
  namespace: C["namespace"],
  table: T & string,
  key: Key<C, T>
): Value<C, T> {
  return client.get(databaseKey<C, T>(namespace, table, key));
}

/**
 * Remove the value for the given key
 * @param client TupleDatabaseClient
 * @param table Table to remove the given key from
 * @param key Key to identify the record to remove from the table
 * @param options {
 *  transaction?: Append to an existing transaction, do not commit
 *  defaultValue?: Default value to use if the key does not exist
 * }
 * @returns Transaction
 */
export function remove<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]>(
  client: TupleDatabaseClient,
  namespace: C["namespace"],
  table: T & string,
  key: Key<C, T>,
  options?: RemoveOptions
) {
  const tx = options?.transaction ?? client.transact();
  tx.remove(databaseKey<C, T>(namespace, table, key));
  if (!options?.transaction) tx.commit();
  return tx;
}

/**
 * Subscribe to changes in the database
 * @param client TupleDatabaseClient
 * @param callback Callback to be called when a change occurs
 * @param filter {
 *  table?: Table to subscribe to. If none is given, all tables are subscribed to
 *  key?: Filters to determine key to subscribe to. If none is given, all keys are subscribed to
 * }
 * @returns Function to unsubscribe
 */
export function subscribe<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]>(
  client: TupleDatabaseClient,
  callback: SubscriptionCallback<C, T>,
  filter?: SubscriptionFilterOptions<C, T>
) {
  const { namespace, table, key } = filter || {};

  const prefix = table && namespace ? [namespace, table] : undefined;

  const scanArgs: ScanArgs<Tuple, Tuple> = {};

  // Transform scan args
  scanArgs.gte = key?.gte && recordToTuple(key.gte);
  scanArgs.gt = key?.gt && recordToTuple(key.gt);
  scanArgs.lte = key?.lte && recordToTuple(key.lte);
  scanArgs.lt = key?.lt && recordToTuple(key.lt);

  // Override gte and lte if eq is set
  if (key?.eq) {
    scanArgs.gte = recordToTuple(key.eq);
    scanArgs.lte = recordToTuple(key.eq);
  }

  return client.subscribe({ prefix, ...scanArgs }, (write) => {
    const updates: Record<string, Update> = {};

    // Transform the writes into the expected format
    for (const update of write.set ?? []) {
      // The first tuple element is always the table name
      const [namespace, table] = update.key;
      if (typeof namespace !== "string" || typeof table !== "string") {
        console.warn(
          "store-cache: Expected first tuple elements to be namespace and table, ignoring set operation:",
          update
        );
        continue;
      }

      // Add the set event to the updates for this table
      updates[toSelector(namespace, table)] ??= { namespace, table, set: [], remove: [] } satisfies Update;
      updates[toSelector(namespace, table)].set.push({ key: tupleToRecord(update.key), value: update.value });
    }

    for (const removedKey of write.remove ?? []) {
      // The first tuple element is always the table name
      const [namespace, table] = removedKey;
      if (typeof namespace !== "string" || typeof table !== "string") {
        console.warn(
          "store-cache: Expected first tuple elements to be namespace and table, ignoring remove operation:",
          removedKey
        );
        continue;
      }

      // Add the remove event to the updates for this table
      updates[toSelector(namespace, table)] ??= { namespace, table, set: [], remove: [] } satisfies Update;
      updates[toSelector(namespace, table)].remove.push({ key: tupleToRecord(removedKey) });
    }

    callback(Object.values(updates) as Update<C, T>[]);
  });
}

/**
 * Map a table schema to the corresponding default value
 */
export function getDefaultValue<Schema extends Record<string, string>>(schema?: Schema) {
  if (schema == null) return undefined;

  // Map schema to its default values
  const defaultValue: Record<string, unknown> = {};
  for (const key in schema) {
    defaultValue[key] = getAbiTypeDefaultValue(schema[key]);
  }

  return defaultValue as SchemaToPrimitives<Schema>;
}

/**
 * Convert a table and key into the corresponding tuple expected by tuple-database
 */
function databaseKey<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]>(
  namespace: C["namespace"],
  table: T & string,
  key: Key<C, T>
) {
  return [namespace, table, ...recordToTuple(key)] satisfies Tuple;
}

/**
 * Convert a record like `{ a: string, b: number }` to a record tuple like `[{ a: string }, { b: number }]`,
 * as expected for keys in tuple-database
 */
function recordToTuple(record: Record<string, unknown>): Tuple {
  const tuple = [];
  for (const [key, value] of Object.entries(record)) {
    tuple.push({ [key]: serializeKey(value) });
  }
  return tuple;
}

/**
 * Convert a record tuple like `[{ a: string }, { b: number }]` to a record like `{ a: string, b: number }`,
 */
function tupleToRecord(tuple: Tuple): Record<string, any> {
  const record: Record<string, unknown> = {};

  for (const entry of tuple) {
    // Ignore all non-object tuple values
    if (entry === null || Array.isArray(entry) || typeof entry !== "object") continue;
    for (const [key, value] of Object.entries(entry)) {
      record[key] = deserializeKey(value);
    }
  }
  return record;
}

/**
 * Helper to serialize values that are not natively supported in keys by tuple-database.
 * (see https://github.com/ccorcos/tuple-database/issues/25)
 * For now only `bigint` needs serialization.
 */
function serializeKey(key: unknown) {
  if (typeof key === "bigint") return `${key.toString()}n`;
  return key;
}

/**
 * Helper to deserialize values that were serialized by `serializeKey` (because they are not natively supported in keys by tuple-database).
 * (see https://github.com/ccorcos/tuple-database/issues/25)
 * For now only `bigint` is serialized and need to be deserialized here.
 */
function deserializeKey(key: unknown): unknown {
  // Check whether the key matches the mattern `${number}n`
  // (serialization of bigint in `serializeKey`)
  // and turn it back into a bigint
  if (typeof key === "string" && /^-?\d+n$/.test(key)) {
    return BigInt(key.slice(0, -1));
  }
  return key;
}

/**
 * Helper to concat namespace and table with a separator
 */
function toSelector(namespace: string, table: string) {
  return namespace + "/" + table;
}
