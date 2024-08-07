import { Context } from "./common";
import { BoundTable, getTable } from "./getTable";

export type BoundTables = {
  [namespace: string]: {
    [table: string]: BoundTable;
  };
};

export type GetTablesResult = BoundTables;

export const getTables =
  (context: Context): (() => GetTablesResult) =>
  (): BoundTables => {
    const { get } = context;

    const boundTables: BoundTables = {};
    const config = get().config;
    for (const namespace of Object.keys(config)) {
      boundTables[namespace] ??= {};
      for (const label of Object.keys(config[namespace])) {
        boundTables[namespace][label] = getTable(context)({ namespace, label });
      }
    }
    return boundTables;
  };
