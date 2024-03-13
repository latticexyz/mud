import { ZustandStore } from "../zustand";
import { AllTables, QueryCondition, QueryResultSubject, TableSubject } from "./common";
import { SchemaToPrimitives, StoreConfig, Table, Tables } from "@latticexyz/store";
import { query } from "./query";
import { subscribeToQuery } from "./subscribeToQuery";
import { Observable, map } from "rxjs";
import { encodeEntity } from "../recs";
import { KeySchema, SchemaToPrimitives as SchemaToPrimitivesProtocol } from "@latticexyz/protocol-parser";
import { Entity, QueryFragmentType, UpdateType } from "@latticexyz/recs";

type HasQueryFragment<T extends Table> = {
  type: QueryFragmentType.Has;
  table: T;
};

type NotQueryFragment<T extends Table> = {
  type: QueryFragmentType.Not;
  table: T;
};

type HasValueQueryFragment<T extends Table> = {
  type: QueryFragmentType.HasValue;
  table: T;
  value: SchemaToPrimitives<T["valueSchema"]>;
};

type NotValueQueryFragment<T extends Table> = {
  type: QueryFragmentType.NotValue;
  table: T;
  value: SchemaToPrimitives<T["valueSchema"]>;
};

export function Has<T extends Table>(table: T): HasQueryFragment<T> {
  return { type: QueryFragmentType.Has, table };
}

export function Not<T extends Table>(table: T): NotQueryFragment<T> {
  return { type: QueryFragmentType.Not, table };
}

export function HasValue<T extends Table>(
  table: T,
  value: SchemaToPrimitives<T["valueSchema"]>,
): HasValueQueryFragment<T> {
  return { type: QueryFragmentType.HasValue, table, value };
}

export function NotValue<T extends Table>(
  table: T,
  value: SchemaToPrimitives<T["valueSchema"]>,
): NotValueQueryFragment<T> {
  return { type: QueryFragmentType.NotValue, table, value };
}

type QueryFragment<T extends Table> =
  | HasQueryFragment<T>
  | NotQueryFragment<T>
  | HasValueQueryFragment<T>
  | NotValueQueryFragment<T>;

function fragmentToTableSubject(fragment: QueryFragment<Table>): TableSubject {
  return {
    tableId: fragment.table.tableId,
    subject: Object.keys(fragment.table.keySchema),
  };
}

function fragmentToQueryConditions(fragment: QueryFragment<Table>): QueryCondition[] {
  return Object.entries((fragment as HasValueQueryFragment<Table> | NotValueQueryFragment<Table>).value).map(
    ([field, right]) => {
      if (fragment.type === QueryFragmentType.HasValue) {
        return {
          left: { tableId: fragment.table.tableId, field },
          op: "=",
          right,
        };
      } else {
        return {
          left: { tableId: fragment.table.tableId, field },
          op: "!=",
          right,
        };
      }
    },
  ) as QueryCondition[];
}

function fragmentsToFrom(fragments: QueryFragment<Table>[]): TableSubject[] {
  return fragments
    .filter(
      (fragment) =>
        fragment.type === QueryFragmentType.Has ||
        fragment.type === QueryFragmentType.HasValue ||
        fragment.type === QueryFragmentType.NotValue,
    )
    .map(fragmentToTableSubject);
}

function fragmentsToExcept(fragments: QueryFragment<Table>[]): TableSubject[] {
  return fragments.filter((fragment) => fragment.type === QueryFragmentType.Not).map(fragmentToTableSubject);
}

function fragmentsToWhere(fragments: QueryFragment<Table>[]): QueryCondition[] {
  return fragments
    .filter((fragment) => fragment.type === QueryFragmentType.HasValue || fragment.type === QueryFragmentType.NotValue)
    .map(fragmentToQueryConditions)
    .flat();
}

function fragmentToKeySchema(fragment: QueryFragment<Table>): KeySchema {
  const keySchema: KeySchema = {};
  Object.entries(fragment.table.keySchema).map(([keyName, value]) => (keySchema[keyName] = value.type));

  return keySchema;
}

function subjectToEntity(fragment: QueryFragment<Table>, subject: QueryResultSubject): Entity {
  const keySchema = fragmentToKeySchema(fragment);

  const key: SchemaToPrimitivesProtocol<KeySchema> = {};
  Object.keys(fragment.table.keySchema).map((keyName, i) => (key[keyName] = subject[i]));
  return encodeEntity(keySchema, key);
}

function subjectsToEntities(fragment: QueryFragment<Table>, subjects: readonly QueryResultSubject[]): Entity[] {
  const entities = subjects.map((subject) => {
    return subjectToEntity(fragment, subject);
  });

  return entities;
}

export async function runQuery<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  fragments: QueryFragment<Table>[],
): Promise<Set<Entity>> {
  const from = fragmentsToFrom(fragments);
  const except = fragmentsToExcept(fragments);
  const where = fragmentsToWhere(fragments);

  const result = await query(store, {
    from,
    except,
    where,
  });

  const entities = subjectsToEntities(fragments[0], result);

  return new Set(entities);
}

type ComponentUpdate = {
  entity: Entity;
};

export type EntityChange = ComponentUpdate & { type: UpdateType };

export async function defineQuery<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  fragments: QueryFragment<Table>[],
): Promise<{
  update$: Observable<readonly EntityChange[]>;
  matching: Observable<readonly Entity[]>;
}> {
  const from = fragmentsToFrom(fragments);
  const except = fragmentsToExcept(fragments);
  const where = fragmentsToWhere(fragments);

  const { subjects$, subjectChanges$ } = await subscribeToQuery(store, {
    from,
    except,
    where,
  });

  return {
    update$: subjectChanges$.pipe(
      map((subjectChanges) => {
        return subjectChanges.map((subjectChange) => ({
          type: subjectChange.type === "enter" ? UpdateType.Enter : UpdateType.Exit,
          entity: subjectToEntity(fragments[0], subjectChange.subject),
        }));
      }),
    ),
    matching: subjects$.pipe(map((subjects) => subjectsToEntities(fragments[0], subjects))),
  };
}
