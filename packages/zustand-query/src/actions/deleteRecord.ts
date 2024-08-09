import { Key, Store, TableLabel, withDefaultNamespace } from "../common";
import { encodeKey } from "./encodeKey";

export type DeleteRecordArgs = {
  store: Store;
  table: TableLabel;
  key: Key;
};

export type DeleteRecordResult = void;

export function deleteRecord({ store, table, key }: DeleteRecordArgs): DeleteRecordResult {
  const { namespace, label } = withDefaultNamespace(table);

  if (store.get().config[namespace] == null) {
    throw new Error(`Table '${namespace}__${label}' is not registered yet.`);
  }

  const encodedKey = encodeKey({ store, table, key });
  const prevRecord = store.get().records[namespace][label][encodedKey];

  // Early return if this record doesn't exist
  if (prevRecord == null) return;

  // Delete record
  delete store._.state.records[namespace][label][encodedKey];

  // Notify table subscribers
  store._.tableSubscribers[namespace][label].forEach((subscriber) =>
    subscriber({ [encodedKey]: { prev: prevRecord && { ...prevRecord }, current: undefined } }),
  );
}
