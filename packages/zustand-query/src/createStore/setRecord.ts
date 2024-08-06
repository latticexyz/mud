import { TableLabel, Key, TableRecord } from "../common";
import { Context } from "./common";
import { setRecords } from "./setRecords";

export type SetRecordArgs = {
  table: TableLabel;
  key: Key;
  record: TableRecord;
};

export const setRecord =
  (context: Context): ((args: SetRecordArgs) => void) =>
  ({ table, key, record }) => {
    setRecords(context)({
      table,
      records: [
        // Stored record should include key
        { ...record, ...key },
      ],
    });
  };
