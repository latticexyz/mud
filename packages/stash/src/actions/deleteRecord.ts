import { Table } from "@latticexyz/config";
import { Key, Stash } from "../common";
import { encodeKey } from "./encodeKey";
import { registerTable } from "./registerTable";

export type DeleteRecordArgs<table extends Table = Table> = {
  stash: Stash;
  table: table;
  key: Key<table>;
};

export type DeleteRecordResult = void;

export function deleteRecord<table extends Table>({ stash, table, key }: DeleteRecordArgs<table>): DeleteRecordResult {
  const { namespaceLabel, label } = table;

  if (stash.get().config[namespaceLabel] == null) {
    registerTable({ stash, table });
  }

  const encodedKey = encodeKey({ table, key });
  const prevRecord = stash.get().records[namespaceLabel]?.[label]?.[encodedKey];

  // Early return if this record doesn't exist
  if (prevRecord == null) return;

  // Delete record
  delete stash._.state.records[namespaceLabel]?.[label]?.[encodedKey];

  // Notify table subscribers
  const updates = { [encodedKey]: { prev: prevRecord && { ...prevRecord }, current: undefined } };
  stash._.tableSubscribers[namespaceLabel]?.[label]?.forEach((subscriber) => subscriber(updates));

  // Notify stash subscribers
  const storeUpdate = { config: {}, records: { [namespaceLabel]: { [label]: updates } } };
  stash._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdate));
}
