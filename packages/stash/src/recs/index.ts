import { In, MatchRecord, NotIn, NotMatchRecord } from "../queryFragments";
import { Query, Store, TableRecord } from "../common";
import { UpdateType as RecsUpdateType } from "@latticexyz/recs";
import { BoundTable, getTable } from "../actions/getTable";
import { runQuery as runQueryInternal } from "../actions/runQuery";
import { QueryUpdate, subscribeQuery } from "../actions/subscribeQuery";
import { getConfig } from "../actions";

export type Entity = string;
export const singletonEntity = "";

export enum UpdateType {
  Enter = "enter",
  Update = "update",
  Exit = "exit",
}

export function hasComponent(t: BoundTable, key: string): boolean {
  return Boolean(t.getKeys()[key]);
}

export function setComponent(t: BoundTable, key: string, value: TableRecord) {
  t.setRecord({
    key: t.decodeKey({ encodedKey: key }),
    record: value,
  });
}

export function updateComponent(t: BoundTable, key: string, value: TableRecord) {
  setComponent(t, key, value);
}

export function removeComponent(t: BoundTable, key: string) {
  t.deleteRecord({ key: t.decodeKey({ encodedKey: key }) });
}

export function getComponentValue(t: BoundTable, key: string): TableRecord | undefined {
  return t.getRecord({ key: t.decodeKey({ encodedKey: key }) });
}

export function getComponentValueStrict(t: BoundTable, key: string): TableRecord {
  const value = getComponentValue(t, key);
  if (!value) {
    throw new Error(`No value found for key ${key} in table ${t.getConfig().key}`);
  }
  return value;
}

export function Has(t: BoundTable) {
  return In(t.getConfig());
}
export function Not(t: BoundTable) {
  return NotIn(t.getConfig());
}

export function HasValue(t: BoundTable, partialRecord: TableRecord) {
  return MatchRecord(t.getConfig(), partialRecord);
}

export function NotValue(t: BoundTable, partialRecord: TableRecord) {
  return NotMatchRecord(t.getConfig(), partialRecord);
}

export function runQuery(store: Store, query: Query) {
  const result = runQueryInternal({ store, query });

  return new Set(Object.keys(result.keys));
}

function transformUpdateType(type: "enter" | "update" | "exit") {
  switch (type) {
    case "enter":
      return RecsUpdateType.Enter;
    case "update":
      return RecsUpdateType.Update;
    case "exit":
      return RecsUpdateType.Exit;
  }
}

type SystemUpdate = {
  entity: string;
  value: [TableRecord | undefined, TableRecord | undefined];
  type: RecsUpdateType;
  component: BoundTable;
};

function transformUpdate(s: Store, update: QueryUpdate, updateFilter?: "enter" | "update" | "exit"): SystemUpdate[] {
  const transformedUpdates = [] as SystemUpdate[];

  const namespaces = Object.entries(update.records);
  for (const [namespaceLabel, tableUpdates] of namespaces) {
    for (const [tableLabel, updates] of Object.entries(tableUpdates)) {
      const table = getTable({
        store: s,
        table: getConfig({ store: s, table: { namespaceLabel, label: tableLabel } }),
      });
      const updateList = Object.entries(updates);

      for (const [key, recordUpdate] of updateList) {
        if (!recordUpdate) {
          continue;
        }

        if (updateFilter && updateFilter !== update.types[key]) {
          continue;
        }

        transformedUpdates.push({
          component: table,
          entity: key,
          value: [recordUpdate.current, recordUpdate.prev],
          type: transformUpdateType(update.types[key]),
        });
      }
    }
  }

  return transformedUpdates;
}

function defineSystemInternal(
  store: Store,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
  updateFilter?: "enter" | "update" | "exit",
) {
  subscribeQuery({
    store,
    query,
    options: {
      skipInitialRun: !options.runOnInit,
      initialSubscribers: [
        (update) => {
          const updates = transformUpdate(store, update, updateFilter);
          for (const update of updates) {
            system(update);
          }
        },
      ],
    },
  });
}

export function defineSystem(
  store: Store,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(store, query, system, options);
}

export function defineEnterSystem(
  store: Store,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(store, query, system, options, "enter");
}

export function defineUpdateSystem(
  store: Store,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(store, query, system, options, "update");
}

export function defineExitSystem(
  store: Store,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(store, query, system, options, "exit");
}
