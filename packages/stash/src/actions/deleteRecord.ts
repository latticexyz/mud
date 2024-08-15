import { Table } from "@latticexyz/config";
import { Key, Store } from "../common";
import { encodeKey } from "./encodeKey";
import { registerTable } from "./registerTable";

export type DeleteRecordArgs<table extends Table = Table> = {
  store: Store;
  table: table;
  key: Key<table>;
};

export type DeleteRecordResult = void;

export function deleteRecord<table extends Table>({ store, table, key }: DeleteRecordArgs<table>): DeleteRecordResult {
  const { namespaceLabel, label } = table;

  if (store.get().config[namespaceLabel] == null) {
    registerTable({ store, table });
  }

  const encodedKey = encodeKey({ table, key });
  const prevRecord = store.get().records[namespaceLabel][label][encodedKey];

  // Early return if this record doesn't exist
  if (prevRecord == null) return;

  // Delete record
  delete store._.state.records[namespaceLabel][label][encodedKey];

  // Notify table subscribers
  const updates = { [encodedKey]: { prev: prevRecord && { ...prevRecord }, current: undefined } };
  store._.tableSubscribers[namespaceLabel][label].forEach((subscriber) => subscriber(updates));

  // Notify store subscribers
  const storeUpdate = { config: {}, records: { [namespaceLabel]: { [label]: updates } } };
  store._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdate));
}
