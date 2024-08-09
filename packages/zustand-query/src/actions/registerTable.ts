import { TableInput, resolveTable } from "@latticexyz/store/config/v2";
import { getTable, BoundTable } from "./getTable";
import { Store } from "../common";

export type RegisterTableArgs = {
  store: Store;
  table: TableInput;
};

export type RegisterTableResult = BoundTable;

export function registerTable({ store, table }: RegisterTableArgs): RegisterTableResult {
  // TODO: add option to resolveTable to not include codegen/deploy options?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { codegen, deploy, ...tableConfig } = resolveTable(table);
  const { namespace, label } = tableConfig;

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
