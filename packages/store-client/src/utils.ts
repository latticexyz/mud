import { TupleDatabaseClient, TupleRootTransactionApi } from "tuple-database";
import { ExpandedConfig } from "./types";
import { AbiType } from "@latticexyz/schema-type";
import { AbiDefaults } from "./defaults";

// Set a (partial) value
// The value is merged with the existing value; missing fields are initialzied with the default Solidity value
export function set<C extends ExpandedConfig = ExpandedConfig>(
  client: TupleDatabaseClient,
  table: keyof C["tables"],
  key: C["tables"][typeof table]["primaryKeys"],
  value: Partial<C["tables"][typeof table]["schema"]>,
  options?: {
    defaultValue?: Record<string, unknown>;
    appendToTransaction?: TupleRootTransactionApi;
    noCommit?: boolean;
  }
) {
  const keyTuple = [String(table), ...toKeyTuple(key)];
  const currentValue = client.get(keyTuple) ?? options?.defaultValue;
  const tx = options?.appendToTransaction ?? client.transact();
  tx.set(keyTuple, { ...currentValue, ...value });
  if (!options?.noCommit) tx.commit();
  return tx;
}

// Get a value
export function get<C extends ExpandedConfig = ExpandedConfig>(
  client: TupleDatabaseClient,
  table: keyof C["tables"],
  key: C["tables"][typeof table]["primaryKeys"]
): C["tables"][typeof table]["schema"] {
  return client.get([String(table), ...toKeyTuple(key)]);
}

// Remove a value
export function remove<C extends ExpandedConfig = ExpandedConfig>(
  client: TupleDatabaseClient,
  table: keyof C["tables"],
  key: C["tables"][typeof table]["primaryKeys"]
) {
  const tx = client.transact();
  tx.remove([String(table), ...toKeyTuple(key)]);
  tx.commit();
  return tx;
}

/**
 * Map a table schema to the corresponding default value
 */
export function getDefaultValue(table?: Record<string, AbiType>) {
  if (table == null) return undefined;

  // Map schema to its default values
  const defaultValue: Record<string, unknown> = {};
  for (const key in table) {
    defaultValue[key] = AbiDefaults[table[key]];
  }
  return defaultValue;
}

/**
 * Convert a record like `{ a: string, b: number }` to a record tuple like `[{ a: string }, { b: number }]`,
 * as expected by tuple-database
 */
function toKeyTuple(record: Record<string, unknown>): Record<string, unknown>[] {
  const tuple = [];
  for (const [key, value] of Object.entries(record)) {
    tuple.push({ [key]: flatten(value) });
  }
  return tuple;
}

/**
 * Helper to serialize bigints
 */
function flatten(value: unknown) {
  if (typeof value === "bigint") return String(value);
  return value;
}
