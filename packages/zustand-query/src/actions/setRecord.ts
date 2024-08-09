import { TableLabel, Key, TableRecord, Store } from "../common";
import { setRecords } from "./setRecords";

export type SetRecordArgs = {
  store: Store;
  table: TableLabel;
  key: Key;
  record: TableRecord;
};

export type SetRecordResult = void;

export function setRecord({ store, table, key, record }: SetRecordArgs): SetRecordResult {
  setRecords({
    store,
    table,
    records: [
      // Stored record should include key
      { ...record, ...key },
    ],
  });
}
