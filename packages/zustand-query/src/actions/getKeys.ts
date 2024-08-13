import { Table } from "@latticexyz/config";
import { Store, Keys } from "../common";
import { decodeKey } from "./decodeKey";

export type GetKeysArgs<table extends Table = Table> = {
  store: Store;
  table: table;
};

export type GetKeysResult<table extends Table = Table> = Keys<table>;

export function getKeys<table extends Table>({ store, table }: GetKeysArgs<table>): GetKeysResult<table> {
  const { namespace, label } = table;

  return Object.fromEntries(
    Object.keys(store.get().records[namespace][label]).map((encodedKey) => [
      encodedKey,
      decodeKey({ store, table, encodedKey }),
    ]),
  );
}
