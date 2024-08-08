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
  store._.subscribers[namespace] ??= {};
  store._.subscribers[namespace][label] ??= new Set();

  return getTable({ store, table });
}
