import { Key, TableLabel, TableRecord } from "../common";
import { Context } from "./common";
import { encodeKey } from "./encodeKey";

export type GetRecordArgs = {
  table: TableLabel;
  key: Key;
};

export type GetRecordResult = TableRecord;

export const getRecord =
  (context: Context): ((args: GetRecordArgs) => GetRecordResult) =>
  ({ table: tableLabel, key }) => {
    const { get } = context;
    return get().records[tableLabel.namespace ?? ""][tableLabel.label][encodeKey(context, tableLabel, key)];
  };
