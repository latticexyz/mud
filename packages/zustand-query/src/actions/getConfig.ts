import { Table } from "@latticexyz/config";
import { Store, TableLabel, withDefaultNamespace } from "../common";

export type GetConfigArgs = {
  store: Store;
  table: TableLabel;
};

export type GetConfigResult = Table;

export function getConfig({ store, table }: GetConfigArgs): GetConfigResult {
  const { namespace, label } = withDefaultNamespace(table);
  return store.get().config[namespace][label];
}
