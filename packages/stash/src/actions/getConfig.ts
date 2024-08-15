import { Table } from "@latticexyz/config";
import { Stash } from "../common";

export type GetConfigArgs = {
  stash: Stash;
  table: { label: string; namespaceLabel?: string };
};

export type GetConfigResult<table extends Table = Table> = table;

export function getConfig({ stash, table }: GetConfigArgs): GetConfigResult<Table> {
  const { namespaceLabel, label } = table;
  return stash.get().config[namespaceLabel ?? ""][label];
}
