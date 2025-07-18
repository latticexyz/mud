import { schemaAbiTypeToDefaultValue } from "@latticexyz/schema-type/internal";
import { DerivedTable, PendingStashUpdate, Stash, TableUpdate, TableUpdates } from "../common";
import { encodeKey } from "./encodeKey";
import { registerTable } from "./registerTable";

export type ApplyUpdatesArgs = {
  stash: Stash;
  updates: readonly PendingStashUpdate[];
};

type PendingUpdates = {
  [namespaceLabel: string]: {
    [tableLabel: string]: TableUpdates;
  };
};

const pendingStashUpdates = new Map<Stash, PendingUpdates>();

export function applyUpdates({ stash, updates }: ApplyUpdatesArgs): void {
  const pendingUpdates = pendingStashUpdates.get(stash) ?? {};
  if (!pendingStashUpdates.has(stash)) pendingStashUpdates.set(stash, pendingUpdates);

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
    const tableUpdates = ((pendingUpdates[table.namespaceLabel] ??= {})[table.label] ??= []);
    const update: TableUpdate = {
      table,
      key,
      previous: prevRecord,
      current: nextRecord,
    };
    tableUpdates.push(update);

    // update derived tables
    const derivedTables = stash._.derivedTables?.[table.namespaceLabel]?.[table.label];
    if (derivedTables != null) {
      updateDerivedTables({ stash, derivedTables, update });
    }
  }

  queueMicrotask(() => {
    notifySubscribers(stash);
  });
}

function notifySubscribers(stash: Stash) {
  const pendingUpdates = pendingStashUpdates.get(stash);
  if (!pendingUpdates) return;

  // Notify table subscribers
  for (const [namespaceLabel, namespaceUpdates] of Object.entries(pendingUpdates)) {
    for (const [tableLabel, tableUpdates] of Object.entries(namespaceUpdates)) {
      stash._.tableSubscribers[namespaceLabel]?.[tableLabel]?.forEach((subscriber) => subscriber(tableUpdates));
    }
  }
  // Notify stash subscribers
  const updates = Object.values(pendingUpdates)
    .map((namespaceUpdates) => Object.values(namespaceUpdates))
    .flat(2);
  stash._.storeSubscribers.forEach((subscriber) => subscriber({ type: "records", updates }));

  pendingStashUpdates.delete(stash);
}

type UpdateDerivedTableArgs = {
  stash: Stash;
  derivedTables: Record<string, DerivedTable>;
  update: TableUpdate;
};

function updateDerivedTables({ stash, derivedTables, update }: UpdateDerivedTableArgs): void {
  applyUpdates({
    stash,
    updates: Object.values(derivedTables)
      .map(({ deriveUpdates }) => deriveUpdates(update))
      .flat(),
  });
}
