import { Stash, StoreConfig, getNamespaces, getConfig, getNamespaceTables } from "../common";
import { BoundTable, getTable } from "./getTable";

type MutableBoundTables<config extends StoreConfig = StoreConfig> = {
  -readonly [namespace in getNamespaces<config>]: {
    -readonly [table in getNamespaceTables<config, namespace>]: BoundTable<getConfig<config, namespace, table>>;
  };
};

export type BoundTables<config extends StoreConfig = StoreConfig> = {
  [namespace in getNamespaces<config>]: {
    [table in getNamespaceTables<config, namespace>]: BoundTable<getConfig<config, namespace, table>>;
  };
};

export type GetTablesArgs<config extends StoreConfig = StoreConfig> = {
  stash: Stash<config>;
};

export type GetTablesResult<config extends StoreConfig = StoreConfig> = BoundTables<config>;

export function getTables<config extends StoreConfig>({ stash }: GetTablesArgs<config>): GetTablesResult<config> {
  const boundTables: MutableBoundTables = {};
  const config = stash.get().config;
  for (const namespace of Object.keys(config)) {
    boundTables[namespace] ??= {};
    for (const label of Object.keys(config[namespace])) {
      boundTables[namespace][label] = getTable({ stash, table: config[namespace][label] }) as never;
    }
  }
  return boundTables as never;
}
