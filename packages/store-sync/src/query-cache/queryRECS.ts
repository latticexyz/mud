import { ZustandStore } from "../zustand";
import { AllTables, QueryCondition, QueryResultSubject, TableSubject } from "./common";
import { SchemaToPrimitives, StoreConfig, Table, Tables } from "@latticexyz/store";
import { query } from "./query";
import { subscribeToQuery } from "./subscribeToQuery";
import { map } from "rxjs";

export type Entity = string;

export enum QueryFragmentType {
  Has,
  HasValue,
  Not,
  NotValue,
}

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

function queryResultSubjectToEntity(keyTuple: QueryResultSubject): Entity {
  return keyTuple.join(":");
}

export async function runQuery<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  fragments: QueryFragment<Table>[],
): Promise<Set<Entity>> {
  const from = fragments
    .filter(
      (fragment) =>
        fragment.type === QueryFragmentType.Has ||
        fragment.type === QueryFragmentType.HasValue ||
        fragment.type === QueryFragmentType.NotValue,
    )
    .map(fragmentToTableSubject);

  const except = fragments.filter((fragment) => fragment.type === QueryFragmentType.Not).map(fragmentToTableSubject);

  const where = fragments
    .filter((fragment) => fragment.type === QueryFragmentType.HasValue || fragment.type === QueryFragmentType.NotValue)
    .map(fragmentToQueryConditions)
    .flat();

  const result = await query(store, {
    from,
    except,
    where,
  });

  const entities = result.map((subject) => queryResultSubjectToEntity(subject));
  return new Set(entities);
}

export async function defineQuery<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  fragments: QueryFragment<Table>[],
): Promise<ReturnType<typeof subscribeToQuery>> {
  const from = fragments
    .filter(
      (fragment) =>
        fragment.type === QueryFragmentType.Has ||
        fragment.type === QueryFragmentType.HasValue ||
        fragment.type === QueryFragmentType.NotValue,
    )
    .map(fragmentToTableSubject);

  const except = fragments.filter((fragment) => fragment.type === QueryFragmentType.Not).map(fragmentToTableSubject);

  const where = fragments
    .filter((fragment) => fragment.type === QueryFragmentType.HasValue || fragment.type === QueryFragmentType.NotValue)
    .map(fragmentToQueryConditions)
    .flat();

  const { subjects, subjects$, subjectChanges$ } = await subscribeToQuery(store, {
    from,
    except,
    where,
  });

  return {
    subjects: subjects.map((subject) => queryResultSubjectToEntity(subject)),
    subjects$: subjects$.pipe(map((subjects) => subjects.map((subject) => queryResultSubjectToEntity(subject)))),
    subjectChanges$: subjectChanges$.pipe(
      map((subjectChanges) => {
        return subjectChanges.map((subjectChange) => ({
          type: subjectChange.type,
          subject: queryResultSubjectToEntity(subjectChange.subject),
        }));
      }),
    ),
  };
}
