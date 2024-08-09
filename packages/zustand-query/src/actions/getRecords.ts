import { Key, Store, TableLabel, TableRecords, withDefaultNamespace } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordsArgs = {
  store: Store;
  table: TableLabel;
  keys?: Key[];
};

export type GetRecordsResult = TableRecords;

export function getRecords({ store, table, keys }: GetRecordsArgs): GetRecordsResult {
  const { namespace, label } = withDefaultNamespace(table);
  const records = store.get().records[namespace][label];

  if (!keys) {
    return records;
  }

  return Object.fromEntries(
    keys.map((key) => {
      const encodedKey = encodeKey({ store, table, key });
      return [encodedKey, records[encodedKey]];
    }),
  );
}
