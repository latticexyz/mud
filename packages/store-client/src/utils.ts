import { FieldValue, StoreConfigShorthand } from "@latticexyz/config";
import { TupleDatabaseClient, TupleRootTransactionApi } from "tuple-database";
import { ClientTables } from "./types";
import { SolidityDefaults } from "@latticexyz/schema-type";

// Set a (partial) value
// The value is merged with the existing value; missing fields are initialzied with the default Solidity value
export function upsert<Config extends StoreConfigShorthand = StoreConfigShorthand>(
  client: TupleDatabaseClient,
  table: keyof ClientTables<Config>,
  key: ClientTables<Config>[typeof table]["primaryKeys"],
  value: Partial<ClientTables<Config>[typeof table]["schema"]>,
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
export function get<Config extends StoreConfigShorthand = StoreConfigShorthand>(
  client: TupleDatabaseClient,
  table: keyof ClientTables<Config>,
  key: ClientTables<Config>[typeof table]["primaryKeys"]
): ClientTables<Config>[typeof table]["schema"] {
  return client.get([String(table), ...toKeyTuple(key)]);
}

// Remove a value
export function remove<Config extends StoreConfigShorthand = StoreConfigShorthand>(
  client: TupleDatabaseClient,
  table: keyof ClientTables<Config>,
  key: ClientTables<Config>[typeof table]["primaryKeys"]
) {
  const tx = client.transact();
  tx.remove([String(table), ...toKeyTuple(key)]);
  tx.commit();
  return tx;
}

// TODO: refactor config export to avoid special case for shorthand (by expanding the config)
export function getDefaultValue(table?: string | Record<string, FieldValue>) {
  if (table == null) return undefined;

  // Special case for table shorthand
  if (typeof table === "string") return { value: SolidityDefaults[table] };

  // Map schema to its default values
  const defaultValue: Record<string, unknown> = {};
  for (const key in table) {
    defaultValue[key] = SolidityDefaults[table[key]];
  }
  return defaultValue;
}

function toKeyTuple(record: Record<string, unknown>): Record<string, unknown>[] {
  const tuple = [];
  for (const [key, value] of Object.entries(record)) {
    tuple.push({ [key]: flatten(value) });
  }
  return tuple;
}

function flatten(value: unknown) {
  if (typeof value === "bigint") return String(value);
  return value;
}
