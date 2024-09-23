import { Key, TableRecord, Stash } from "../common";
import { setRecords } from "./setRecords";
import { Table } from "@latticexyz/config";

export type SetRecordArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  key: Key<table>;
  value: Partial<TableRecord<table>>;
};

export type SetRecordResult = void;

export function setRecord<table extends Table>({ stash, table, key, value }: SetRecordArgs<table>): SetRecordResult {
  setRecords({
    stash,
    table,
    records: [
      // Stored record should include key
      { ...value, ...key },
    ],
  });
}
