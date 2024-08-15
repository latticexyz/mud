import { Key, TableRecord, Store } from "../common";
import { setRecords } from "./setRecords";
import { Table } from "@latticexyz/config";

export type SetRecordArgs<table extends Table = Table> = {
  stash: Store;
  table: table;
  key: Key<table>;
  record: Partial<TableRecord<table>>;
};

export type SetRecordResult = void;

export function setRecord<table extends Table>({ stash, table, key, record }: SetRecordArgs<table>): SetRecordResult {
  setRecords({
    stash,
    table,
    records: [
      // Stored record should include key
      { ...record, ...key },
    ],
  });
}
