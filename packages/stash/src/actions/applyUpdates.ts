import { schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { Key, Stash, StoreUpdates, TableRecord } from "../common";
import { encodeKey } from "./encodeKey";
import { Table } from "@latticexyz/config";
import { registerTable } from "./registerTable";

export type Update<table extends Table = Table> = {
  table: table;
  key: Key<table>;
  value: undefined | Partial<TableRecord<table>>;
};

export type ApplyUpdatesArgs = {
  stash: Stash;
  updates: Update[];
};

export function applyUpdates({ stash, updates }: ApplyUpdatesArgs): void {
  const storeUpdate: StoreUpdates = { config: {}, records: {} };

  for (const { table, key, value } of updates) {
    if (stash.get().config[table.namespaceLabel]?.[table.label] == null) {
      registerTable({ stash, table });
    }
    const tableState = ((stash._.state.records[table.namespaceLabel] ??= {})[table.label] ??= {});
    const encodedKey = encodeKey({ table, key });
    const prevRecord = tableState[encodedKey];
    // create new record, preserving field order
    const nextRecord =
      value == null
        ? undefined
        : Object.fromEntries(
            Object.entries(table.schema).map(([fieldName, { type }]) => [
              fieldName,
              key[fieldName] ?? // Use provided key fields
                value[fieldName] ?? // Or provided value fields
                prevRecord?.[fieldName] ?? // Keep existing non-overridden fields
                schemaAbiTypeToDefaultValue[type], // Default values for new fields
            ]),
          );

    // apply update to state
    if (nextRecord != null) {
      tableState[encodedKey] = nextRecord;
    } else {
      delete tableState[encodedKey];
    }

    // apply update to store update for notifying subscribers
    ((storeUpdate.records[table.namespaceLabel] ??= {})[table.label] ??= {})[encodedKey] = {
      prev: prevRecord,
      current: nextRecord,
    };
  }

  // Notify table subscribers
  for (const [namespaceLabel, tableUpdates] of Object.entries(storeUpdate.records)) {
    for (const [label, updates] of Object.entries(tableUpdates)) {
      stash._.tableSubscribers[namespaceLabel]?.[label]?.forEach((subscriber) => subscriber(updates));
    }
  }

  // Notify stash subscribers
  stash._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdate));
}
