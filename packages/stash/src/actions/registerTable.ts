import { Table } from "@latticexyz/config";
import { getTable, BoundTable } from "./getTable";
import { Store } from "../common";

export type RegisterTableArgs<table extends Table = Table> = {
  store: Store;
  table: table;
};

export type RegisterTableResult<table extends Table = Table> = BoundTable<table>;

export function registerTable<table extends Table>({
  store,
  table,
}: RegisterTableArgs<table>): RegisterTableResult<table> {
  // Pick only relevant keys from the table config, ignore keys like `codegen`, `deploy`
  const { namespace, namespaceLabel, name, label, key, schema, type, tableId } = table;
  const tableConfig = { namespace, namespaceLabel, name, label, key, schema, type, tableId };

  // Set config for table
  store._.state.config[namespaceLabel] ??= {};
  store._.state.config[namespaceLabel][label] = tableConfig;

  // Init records map for table
  store._.state.records[namespaceLabel] ??= {};
  store._.state.records[namespaceLabel][label] ??= {};

  // Init subscribers set for table
  store._.tableSubscribers[namespaceLabel] ??= {};
  store._.tableSubscribers[namespaceLabel][label] ??= new Set();

  // Notify store subscribers
  const storeUpdate = {
    config: { [namespaceLabel]: { [label]: { prev: undefined, current: tableConfig } } },
    records: {},
  };
  store._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdate));

  return getTable({ store, table });
}
