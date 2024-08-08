import { Store } from "../common";
import { BoundTable, getTable } from "./getTable";

export type BoundTables = {
  [namespace: string]: {
    [table: string]: BoundTable;
  };
};

export type GetTablesArgs = {
  store: Store;
};

export type GetTablesResult = BoundTables;

export function getTables({ store }: GetTablesArgs): GetTablesResult {
  const boundTables: BoundTables = {};
  const config = store.get().config;
  for (const namespace of Object.keys(config)) {
    boundTables[namespace] ??= {};
    for (const label of Object.keys(config[namespace])) {
      boundTables[namespace][label] = getTable({ store, table: { namespace, label } });
    }
  }
  return boundTables;
}
