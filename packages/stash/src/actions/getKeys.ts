import { Table } from "@latticexyz/config";
import { Store, Keys } from "../common";
import { decodeKey } from "./decodeKey";

export type GetKeysArgs<table extends Table = Table> = {
  stash: Store;
  table: table;
};

export type GetKeysResult<table extends Table = Table> = Keys<table>;

export function getKeys<table extends Table>({ stash, table }: GetKeysArgs<table>): GetKeysResult<table> {
  const { namespaceLabel, label } = table;

  return Object.fromEntries(
    Object.keys(stash.get().records[namespaceLabel][label]).map((encodedKey) => [
      encodedKey,
      decodeKey({ stash, table, encodedKey }),
    ]),
  );
}
