import { Table } from "@latticexyz/config";
import { Store } from "../common";

export type GetConfigArgs = {
  store: Store;
  table: { label: string; namespaceLabel?: string };
};

export type GetConfigResult = Table;

export function getConfig({ store, table }: GetConfigArgs): GetConfigResult {
  const { namespaceLabel, label } = table;
  return store.get().config[namespaceLabel ?? ""][label];
}
