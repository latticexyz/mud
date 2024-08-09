import { Key, Store, TableLabel, TableRecord, withDefaultNamespace } from "../common";
import { encodeKey } from "./encodeKey";

export type GetRecordArgs = {
  store: Store;
  table: TableLabel;
  key: Key;
};

export type GetRecordResult = TableRecord;

export function getRecord({ store, table, key }: GetRecordArgs): GetRecordResult {
  const { namespace, label } = withDefaultNamespace(table);

  return store.get().records[namespace][label][encodeKey({ store, table, key })];
}
