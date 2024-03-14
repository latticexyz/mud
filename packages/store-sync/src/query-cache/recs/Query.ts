import { Entity, QueryFragmentType } from "@latticexyz/recs";
import { QueryCacheStore } from "../createStore";
import { query } from "../query";
import { SchemaToPrimitives, Table } from "@latticexyz/store";
import { KeySchema, SchemaToPrimitives as SchemaToPrimitivesProtocol } from "@latticexyz/protocol-parser";
import { encodeEntity } from "../../recs";
import { hexToResource } from "@latticexyz/common";
import { QuerySubjects } from "../common";
import { SubjectRecords } from "@latticexyz/query";

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

export type QueryFragment<T extends Table> =
  | HasQueryFragment<T>
  | NotQueryFragment<T>
  | HasValueQueryFragment<T>
  | NotValueQueryFragment<T>;

function fragmentsToQuerySubjects(fragments: QueryFragment<Table>[]): QuerySubjects {
  const querySubjects: QuerySubjects = {};

  fragments.forEach((fragment) => {
    const { name } = hexToResource(fragment.table.tableId);
    querySubjects[name] = Object.keys(fragment.table.keySchema);
  });

  return querySubjects;
}

function fragmentsToFrom(fragments: QueryFragment<Table>[]): QuerySubjects {
  return fragmentsToQuerySubjects(
    fragments.filter(
      (fragment) =>
        fragment.type === QueryFragmentType.Has ||
        fragment.type === QueryFragmentType.HasValue ||
        fragment.type === QueryFragmentType.NotValue,
    ),
  );
}

function fragmentsToExcept(fragments: QueryFragment<Table>[]): QuerySubjects {
  return fragmentsToQuerySubjects(fragments.filter((fragment) => fragment.type === QueryFragmentType.Not));
}

function fragmentToQueryConditions(fragment: QueryFragment<Table>): any[] {
  return Object.entries((fragment as HasValueQueryFragment<Table> | NotValueQueryFragment<Table>).value).map(
    ([field, right]) => {
      if (fragment.type === QueryFragmentType.HasValue) {
        return [`${hexToResource(fragment.table.tableId).name}.${field}`, "=", right];
      } else {
        return [`${hexToResource(fragment.table.tableId).name}.${field}`, "!=", right];
      }
    },
  ) as any[];
}

function fragmentsToWhere(fragments: QueryFragment<Table>[]): any[] {
  return fragments
    .filter((fragment) => fragment.type === QueryFragmentType.HasValue || fragment.type === QueryFragmentType.NotValue)
    .map(fragmentToQueryConditions)
    .flat();
}

function fragmentToKeySchema(fragment: QueryFragment<Table>): KeySchema {
  const keySchema: KeySchema = {};
  Object.entries(fragment.table.keySchema).forEach(([keyName, value]) => (keySchema[keyName] = value.type));

  return keySchema;
}

function subjectToEntity(fragment: QueryFragment<Table>, subject: SubjectRecords): Entity {
  const keySchema = fragmentToKeySchema(fragment);

  const key: SchemaToPrimitivesProtocol<KeySchema> = {};
  Object.keys(fragment.table.keySchema).forEach((keyName, i) => (key[keyName] = subject.subject[i]));

  return encodeEntity(keySchema, key);
}

function subjectsToEntities(fragment: QueryFragment<Table>, subjects: readonly SubjectRecords[]): Entity[] {
  const entities = subjects.map((subject) => subjectToEntity(fragment, subject));

  return entities;
}

export async function runQuery<store extends QueryCacheStore>(
  store: store,
  fragments: QueryFragment<Table>[],
): Promise<Set<Entity>> {
  const from = fragmentsToFrom(fragments);
  const except = fragmentsToExcept(fragments);
  const where = fragmentsToWhere(fragments);

  const { subjects } = await query(store, { from, except, where });

  const entities = subjectsToEntities(fragments[0], subjects);

  return new Set(entities);
}
