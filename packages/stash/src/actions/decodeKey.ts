import { Table } from "@latticexyz/config";
import { Key, Stash } from "../common";
import { getKey } from "@latticexyz/protocol-parser/internal";

export type DecodeKeyArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  encodedKey: string;
};

export type DecodeKeyResult<table extends Table = Table> = Key<table>;

export function decodeKey<table extends Table>({
  stash,
  table,
  encodedKey,
}: DecodeKeyArgs<table>): DecodeKeyResult<table> {
  const { namespaceLabel, label } = table;
  const record = stash.get().records[namespaceLabel]?.[label]?.[encodedKey];
  if (!record) throw new Error(`No record found for key "${encodedKey}".`);
  return getKey(table, record);
}
