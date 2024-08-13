import { Table } from "@latticexyz/config";
import { getTable, BoundTable } from "./getTable";
import { Store } from "../common";

export type RegisterTableArgs = {
  store: Store;
  table: Table;
};

export type RegisterTableResult = BoundTable;

export function registerTable({ store, table }: RegisterTableArgs): RegisterTableResult {
  // Pick only relevant keys from the table config, ignore keys like `codegen`, `deploy`
  const { namespace, name, label, key, schema, type, tableId } = table;
  const tableConfig = { namespace, name, label, key, schema, type, tableId };

  // Set config for table
  store._.state.config[namespace] ??= {};
  store._.state.config[namespace][label] = tableConfig;

  // Init records map for table
  store._.state.records[namespace] ??= {};
  store._.state.records[namespace][label] ??= {};

  // Init subscribers set for table
  store._.tableSubscribers[namespace] ??= {};
  store._.tableSubscribers[namespace][label] ??= new Set();

  // Notify store subscribers
  const storeUpdate = {
    config: { [namespace]: { [label]: { prev: undefined, current: tableConfig } } },
    records: {},
  };
  store._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdate));

  return getTable({ store, table });
}
