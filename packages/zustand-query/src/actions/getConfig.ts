import { Table } from "@latticexyz/config";
import { Store } from "../common";

export type GetConfigArgs = {
  store: Store;
  table: { label: string; namespaceLabel?: string };
};

export type GetConfigResult<table extends Table = Table> = table;

export function getConfig({ store, table }: GetConfigArgs): GetConfigResult<Table> {
  const { namespaceLabel, label } = table;
  return store.get().config[namespaceLabel ?? ""][label];
}
