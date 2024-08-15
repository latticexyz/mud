import { dynamicAbiTypeToDefaultValue, staticAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { Store, TableRecord, TableUpdates } from "../common";
import { encodeKey } from "./encodeKey";
import { Table } from "@latticexyz/config";
import { registerTable } from "./registerTable";

export type SetRecordsArgs<table extends Table = Table> = {
  store: Store;
  table: table;
  records: TableRecord<table>[];
};

export type SetRecordsResult = void;

export function setRecords<table extends Table>({ store, table, records }: SetRecordsArgs<table>): SetRecordsResult {
  const { namespaceLabel, label, schema } = table;

  if (store.get().config[namespaceLabel]?.[label] == null) {
    registerTable({ store, table });
  }

  // Construct table updates
  const updates: TableUpdates = {};
  for (const record of records) {
    const encodedKey = encodeKey({ table, key: record as never });
    const prevRecord = store.get().records[namespaceLabel][label][encodedKey];
    const newRecord = Object.fromEntries(
      Object.keys(schema).map((fieldName) => [
        fieldName,
        record[fieldName] ?? // Override provided record fields
          prevRecord?.[fieldName] ?? // Keep existing non-overridden fields
          staticAbiTypeToDefaultValue[schema[fieldName] as never] ?? // Default values for new fields
          dynamicAbiTypeToDefaultValue[schema[fieldName] as never],
      ]),
    );
    updates[encodedKey] = { prev: prevRecord, current: newRecord };
  }

  // Update records
  for (const [encodedKey, { current }] of Object.entries(updates)) {
    store._.state.records[namespaceLabel][label][encodedKey] = current as never;
  }

  // Notify table subscribers
  store._.tableSubscribers[namespaceLabel][label].forEach((subscriber) => subscriber(updates));

  // Notify store subscribers
  const storeUpdate = { config: {}, records: { [namespaceLabel]: { [label]: updates } } };
  store._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdate));
}
