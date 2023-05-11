import { ScanArgs, Tuple, TupleDatabaseClient } from "tuple-database";
import { AbiDefaults } from "./defaults";
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

/**
 * Set the value for the given key
 * @param client TupleDatabaseClient
 * @param table Table to set the given key in
 * @param key Key to identify the record to set in the table
 * @param value Value to set for the given key
 * @param options {
 *  appendToTransaction?: Append to an existing transaction, do not commit
 *  defaultValue?: Default value to use if the key does not exist
 * }
 * @returns Transaction
 */
export function set<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]>(
  client: TupleDatabaseClient,
  table: T,
  key: Key<C, T>,
  value: Partial<Value<C, T>>,
  options?: SetOptions
) {
  const keyTuple = [String(table), ...recordToTuple(key)];
  const currentValue = client.get(keyTuple) ?? options?.defaultValue;
  const tx = options?.appendToTransaction ?? client.transact();
  tx.set(keyTuple, { ...currentValue, ...value });
  if (!options?.appendToTransaction) tx.commit();
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
  table: T,
  key: Key<C, T>
): Value<C, T> {
  return client.get([String(table), ...recordToTuple(key)]);
}

/**
 * Remove the value for the given key
 * @param client TupleDatabaseClient
 * @param table Table to remove the given key from
 * @param key Key to identify the record to remove from the table
 * @param options {
 *  appendToTransaction?: Append to an existing transaction, do not commit
 *  defaultValue?: Default value to use if the key does not exist
 * }
 * @returns Transaction
 */
export function remove<C extends StoreConfig = StoreConfig, T extends keyof C["tables"] = keyof C["tables"]>(
  client: TupleDatabaseClient,
  table: T,
  key: Key<C, T>,
  options?: RemoveOptions
) {
  const tx = options?.appendToTransaction ?? client.transact();
  tx.remove([String(table), ...recordToTuple(key)]);
  if (!options?.appendToTransaction) tx.commit();
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
  const { table, key } = filter || {};

  const prefix = table ? [table] : undefined;

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
      const table = update.key[0];
      if (typeof table !== "string") {
        console.error("Unexpected update:", set);
        continue;
      }

      // Add the set event to the updates for this table
      updates[table] = updates[table] ?? ({ table, set: [], remove: [] } satisfies Update);
      updates[table].set.push({ key: tupleToRecord(update.key), value: update.value });
    }

    for (const removedKey of write.remove ?? []) {
      // The first tuple element is always the table name
      const table = removedKey[0];
      if (typeof table !== "string") {
        console.error("Unexpected update:", removedKey);
        continue;
      }

      // Add the remove event to the updates for this table
      updates[table] = updates[table] ?? ({ table, set: [], remove: [] } satisfies Update);
      updates[table].remove.push({ key: tupleToRecord(removedKey) });
    }

    callback(updates as Record<T, Update<C, T>>);
  });
}

/**
 * Map a table schema to the corresponding default value
 */
export function getDefaultValue<Schema extends Record<string, string>>(schema?: Schema) {
  if (schema == null) return undefined;

  // Map schema to its default values
  const defaultValue = {} as SchemaToPrimitives<Schema>;
  for (const key in schema) {
    defaultValue[key] = AbiDefaults[schema[key]];
  }

  return defaultValue;
}

/**
 * Convert a record like `{ a: string, b: number }` to a record tuple like `[{ a: string }, { b: number }]`,
 * as expected for keys in tuple-database
 */
function recordToTuple(record: Record<string, unknown>): Tuple {
  const tuple = [];
  for (const [key, value] of Object.entries(record)) {
    tuple.push({ [key]: flatten(value) });
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
      record[key] = value;
    }
  }
  return record;
}

/**
 * Helper to serialize bigints
 */
function flatten(value: unknown) {
  if (typeof value === "bigint") return String(value);
  return value;
}
