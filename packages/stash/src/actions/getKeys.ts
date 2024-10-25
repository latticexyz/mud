import { Table } from "@latticexyz/config";
import { getKey } from "@latticexyz/protocol-parser/internal";
import { Stash, Keys } from "../common";

export type GetKeysArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
};

export type GetKeysResult<table extends Table = Table> = Keys<table>;

export function getKeys<table extends Table>({ stash, table }: GetKeysArgs<table>): GetKeysResult<table> {
  const { namespaceLabel, label } = table;
  return Object.fromEntries(
    Object.entries(stash.get().records[namespaceLabel]?.[label] ?? {}).map(([encodedKey, record]) => [
      encodedKey,
      getKey(table, record),
    ]),
  );
}
