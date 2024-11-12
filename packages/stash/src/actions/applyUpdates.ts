import { schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { Key, Stash, StoreUpdates, TableRecord } from "../common";
import { encodeKey } from "./encodeKey";
import { Table } from "@latticexyz/config";
import { registerTable } from "./registerTable";

export type StashUpdate<table extends Table = Table> = {
  table: table;
  key: Key<table>;
  value: undefined | Partial<TableRecord<table>>;
};

export type ApplyUpdatesArgs = {
  stash: Stash;
  updates: StashUpdate[];
};

const pendingUpdates = new Map<Stash, StoreUpdates>();

export function applyUpdates({ stash, updates }: ApplyUpdatesArgs): void {
  const storeUpdates = pendingUpdates.get(stash) ?? { config: {}, records: {} };
  if (!pendingUpdates.has(stash)) pendingUpdates.set(stash, storeUpdates);

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

    // add update to pending updates for notifying subscribers
    const prevUpdate = storeUpdates.records[table.namespaceLabel]?.[table.label]?.[encodedKey];
    const update = {
      // preserve the initial prev state if we already have a pending update
      // TODO: change subscribers to an array of updates instead of an object
      prev: prevUpdate ? prevUpdate.prev : prevRecord,
      current: nextRecord,
    };
    ((storeUpdates.records[table.namespaceLabel] ??= {})[table.label] ??= {})[encodedKey] ??= update;
  }

  queueMicrotask(() => {
    notifySubscribers(stash);
  });
}

function notifySubscribers(stash: Stash) {
  const storeUpdates = pendingUpdates.get(stash);
  if (!storeUpdates) return;

  // Notify table subscribers
  for (const [namespaceLabel, tableUpdates] of Object.entries(storeUpdates.records)) {
    for (const [label, updates] of Object.entries(tableUpdates)) {
      stash._.tableSubscribers[namespaceLabel]?.[label]?.forEach((subscriber) => subscriber(updates));
    }
  }
  // Notify stash subscribers
  stash._.storeSubscribers.forEach((subscriber) => subscriber(storeUpdates));

  pendingUpdates.delete(stash);
}
