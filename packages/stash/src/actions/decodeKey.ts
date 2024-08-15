import { Table } from "@latticexyz/config";
import { Key, Store } from "../common";

export type DecodeKeyArgs<table extends Table = Table> = {
  store: Store;
  table: table;
  encodedKey: string;
};

export type DecodeKeyResult<table extends Table = Table> = Key<table>;

export function decodeKey<table extends Table>({
  store,
  table,
  encodedKey,
}: DecodeKeyArgs<table>): DecodeKeyResult<table> {
  const { namespaceLabel, label, key } = table;
  const record = store.get().records[namespaceLabel][label][encodedKey];

  // Typecast needed because record values could be arrays, but we know they are not if they are key fields
  return Object.fromEntries(Object.entries(record).filter(([field]) => key.includes(field))) as never;
}
