import { dynamicAbiTypeToDefaultValue, staticAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { Store, TableRecord, TableUpdates } from "../common";
import { encodeKey } from "./encodeKey";
import { Table } from "@latticexyz/config";
import { registerTable } from "./registerTable";

export type SetRecordsArgs<table extends Table = Table> = {
  stash: Store;
  table: table;
  records: TableRecord<table>[];
};

export type SetRecordsResult = void;

export function setRecords<table extends Table>({ stash, table, records }: SetRecordsArgs<table>): SetRecordsResult {
  const { namespaceLabel, label, schema } = table;

  if (stash.get().config[namespaceLabel]?.[label] == null) {
    registerTable({ stash, table });
  }

  // Construct table updates
  const updates: TableUpdates = {};
  for (const record of records) {
    const encodedKey = encodeKey({ table, key: record as never });
    const prevRecord = stash.get().records[namespaceLabel][label][encodedKey];
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
    stash._.state.records[namespaceLabel][label][encodedKey] = current as never;
  }

  // Notify table subscribers
  stash._.tableSubscribers[namespaceLabel][label].forEach((subscriber) => subscriber(updates));

  // Notify stash subscribers
  const storeUpdate = { config: {}, records: { [namespaceLabel]: { [label]: updates } } };
  stash._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdate));
}
