import { Table } from "@latticexyz/config";
import { Store } from "../common";

export type GetConfigArgs = {
  store: Store;
  table: { label: string; namespace?: string };
};

export type GetConfigResult = Table;

export function getConfig({ store, table }: GetConfigArgs): GetConfigResult {
  const { namespace, label } = table;
  return store.get().config[namespace ?? ""][label];
}
