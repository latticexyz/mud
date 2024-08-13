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
  const { namespace, label } = table;
  return store.get().records[namespace][label][encodeKey({ table, key })];
}
