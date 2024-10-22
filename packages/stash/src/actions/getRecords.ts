import { Table } from "@latticexyz/config";
import { Key, Stash, TableRecords } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordsArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  keys?: Key<table>[];
};

export type GetRecordsResult<table extends Table = Table> = TableRecords<table>;

export function getRecords<table extends Table>({
  stash,
  table,
  keys,
}: GetRecordsArgs<table>): GetRecordsResult<table> {
  const { namespaceLabel, label } = table;
  const records = stash.get().records[namespaceLabel][label];

  if (!keys || !keys.length) {
    return records;
  }

  return Object.fromEntries(
    keys.map((key) => {
      const encodedKey = encodeKey({ table, key });
      return [encodedKey, records[encodedKey]];
    }),
  );
}
