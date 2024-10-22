import { Table } from "@latticexyz/config";
import { Key, Stash, TableRecord } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  key: Key<table>;
};

export type GetRecordResult<table extends Table = Table> = TableRecord<table> | undefined;

export function getRecord<table extends Table>({ stash, table, key }: GetRecordArgs<table>): GetRecordResult<table> {
  const { namespaceLabel, label } = table;
  return stash.get().records[namespaceLabel]?.[label]?.[encodeKey({ table, key })];
}
