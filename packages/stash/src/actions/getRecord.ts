import { Table } from "@latticexyz/config";
import { Key, Store, TableRecord } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordArgs<table extends Table = Table> = {
  store: Store;
  table: table;
  key: Key<table>;
};

export type GetRecordResult<table extends Table = Table> = TableRecord<table>;

export function getRecord<table extends Table>({ store, table, key }: GetRecordArgs<table>): GetRecordResult<table> {
  const { namespaceLabel, label } = table;
  return store.get().records[namespaceLabel][label][encodeKey({ table, key })];
}
