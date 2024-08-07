import { Key, TableLabel, TableRecords } from "../common";
import { Context } from "./common";
import { encodeKey } from "./encodeKey";

export type GetRecordsArgs = {
  table: TableLabel;
  keys?: Key[];
};

export type GetRecordsResult = TableRecords;

export const getRecords =
  (context: Context): ((args: GetRecordsArgs) => GetRecordsResult) =>
  ({ table: tableLabel, keys }) => {
    const { get } = context;
    const namespace = tableLabel.namespace ?? "";
    const label = tableLabel.label;
    const records = get().records[namespace][label];

    if (!keys) {
      return records;
    }

    return Object.fromEntries(
      keys.map((key) => {
        const encodedKey = encodeKey(context, tableLabel, key);
        return [encodedKey, records[encodedKey]];
      }),
    );
  };
