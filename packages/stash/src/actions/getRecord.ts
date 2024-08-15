import { Table } from "@latticexyz/config";
import { Key, Store, TableRecord } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordArgs<table extends Table = Table> = {
  stash: Store;
  table: table;
  key: Key<table>;
};

export type GetRecordResult<table extends Table = Table> = TableRecord<table>;

export function getRecord<table extends Table>({ stash, table, key }: GetRecordArgs<table>): GetRecordResult<table> {
  const { namespaceLabel, label } = table;
  return stash.get().records[namespaceLabel][label][encodeKey({ table, key })];
}
