import { In, MatchRecord, NotIn, NotMatchRecord } from "../queryFragments";
import { Query, Stash, TableRecord } from "../common";
import { BoundTable, getTable } from "../actions/getTable";
import { runQuery as runQueryInternal } from "../actions/runQuery";
import { QueryUpdate, subscribeQuery } from "../actions/subscribeQuery";
import { getConfig } from "../actions";
import { Subject } from "rxjs";

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

export function runQuery(stash: Stash, query: Query) {
  const result = runQueryInternal({ stash, query });

  return new Set(Object.keys(result.keys));
}

type SystemUpdate<T extends BoundTable = BoundTable> = {
  entity: string;
  value: [TableRecord | undefined, TableRecord | undefined];
  type: UpdateType;
  component: T;
};

function transformUpdate(s: Stash, update: QueryUpdate, updateFilter?: UpdateType): SystemUpdate[] {
  const transformedUpdates = [] as SystemUpdate[];

  const namespaces = Object.entries(update.records);
  for (const [namespaceLabel, tableUpdates] of namespaces) {
    for (const [tableLabel, updates] of Object.entries(tableUpdates)) {
      const table = getTable({
        stash: s,
        table: getConfig({ stash: s, table: { namespaceLabel, label: tableLabel } }),
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
          type: update.types[key] as UpdateType,
        });
      }
    }
  }

  return transformedUpdates;
}

export function componentValueEquals(value1: TableRecord, value2: TableRecord): boolean {
  return JSON.stringify(value1) === JSON.stringify(value2);
}

export function defineSyncSystem(
  stash: Stash,
  query: Query,
  component: (entity: Entity) => BoundTable,
  value: (entity: Entity) => TableRecord,
  options: { update?: boolean; runOnInit?: boolean } = { update: false, runOnInit: true },
) {
  defineSystemInternal(
    stash,
    query,
    ({ entity, type }) => {
      if (type === UpdateType.Enter) setComponent(component(entity), entity, value(entity));
      if (type === UpdateType.Exit) removeComponent(component(entity), entity);
      if (options?.update && type === UpdateType.Update) setComponent(component(entity), entity, value(entity));
    },
    options,
  );
}

export function defineComponentSystem(stash: Stash, table: BoundTable, system: (update: SystemUpdate) => void) {
  table.subscribe({
    subscriber: (updates) => {
      for (const [key, update] of Object.entries(updates)) {
        let updateType = UpdateType.Update;
        if (update.prev === undefined) {
          updateType = UpdateType.Enter;
        } else if (update.current === undefined) {
          updateType = UpdateType.Exit;
        }

        system({ entity: key, value: [update.current, update.prev], type: updateType, component: table });
      }
    },
  });
}

export function isComponentUpdate<T extends BoundTable>(update: SystemUpdate, table: T): update is SystemUpdate<T> {
  return update.component.getConfig().tableId === table.getConfig().tableId;
}

export function getComponentEntities(table: BoundTable) {
  return Object.keys(table.getKeys());
}

export function defineExitQuery(stash: Stash, query: Query) {
  const update$ = new Subject<SystemUpdate>();

  subscribeQuery({
    stash,
    query,
    options: {
      skipInitialRun: true,
    },
  }).subscribe((update) => {
    const updates = transformUpdate(stash, update);
    for (const update of updates) {
      update$.next(update);
    }
  });

  return update$;
}

function defineSystemInternal(
  stash: Stash,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
  updateFilter?: UpdateType,
) {
  subscribeQuery({
    stash,
    query,
    options: {
      skipInitialRun: !options.runOnInit,
      initialSubscribers: [
        (update) => {
          const updates = transformUpdate(stash, update, updateFilter);
          for (const update of updates) {
            system(update);
          }
        },
      ],
    },
  });
}

export function defineSystem(
  stash: Stash,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(stash, query, system, options);
}

export function defineEnterSystem(
  stash: Stash,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(stash, query, system, options, UpdateType.Enter);
}

export function defineUpdateSystem(
  stash: Stash,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(stash, query, system, options, UpdateType.Update);
}

export function defineExitSystem(
  stash: Stash,
  query: Query,
  system: (update: SystemUpdate) => void,
  options: { runOnInit?: boolean } = { runOnInit: true },
) {
  defineSystemInternal(stash, query, system, options, UpdateType.Exit);
}

export function update$Wrapper(table: BoundTable) {
  const update$ = new Subject<SystemUpdate>();

  table.subscribe({
    subscriber: (updates) => {
      for (const [key, update] of Object.entries(updates)) {
        const transformedUpdate = {
          entity: key,
          value: [update.current, update.prev] as [TableRecord | undefined, TableRecord | undefined],
          type: UpdateType.Update,
          component: table,
        };
        update$.next(transformedUpdate);
      }
    },
  });

  return {
    ...table,
    update$,
  };
}
