import { Table } from "@latticexyz/config";
import { Stash } from "../common";

export type GetTableConfigArgs = {
  stash: Stash;
  table: { label: string; namespaceLabel?: string };
};

export type GetTableConfigResult<table extends Table = Table> = table;

export function getTableConfig({ stash, table }: GetTableConfigArgs): GetTableConfigResult<Table> {
  const { namespaceLabel, label } = table;
  const tableConfig = stash.get().config[namespaceLabel ?? ""]?.[label];
  if (tableConfig == null) throw new Error("No table found.");
  return tableConfig;
}
