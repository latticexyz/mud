import { Entity, QueryFragmentType } from "@latticexyz/recs";
import { QueryCacheStore } from "../createStore";
import { query } from "../query";
import { SchemaToPrimitives } from "@latticexyz/store";
import { hexKeyTupleToEntity } from "../../recs";
import { hexToResource } from "@latticexyz/common";
import { QuerySubjects, Tables, extractTables, queryConditions } from "../common";
import { SubjectRecords } from "@latticexyz/query";
import { Table } from "@latticexyz/store/config/v2";

type HasQueryFragment<table extends Table> = {
  type: QueryFragmentType.Has;
  table: table;
};

type NotQueryFragment<table extends Table> = {
  type: QueryFragmentType.Not;
  table: table;
};

type HasValueQueryFragment<table extends Table> = {
  type: QueryFragmentType.HasValue;
  table: table;
  value: Partial<SchemaToPrimitives<table["schema"]>>;
};

type NotValueQueryFragment<table extends Table> = {
  type: QueryFragmentType.NotValue;
  table: table;
  value: Partial<SchemaToPrimitives<table["schema"]>>;
};

type QueryFragment<table extends Table> =
  | HasQueryFragment<table>
  | NotQueryFragment<table>
  | HasValueQueryFragment<table>
  | NotValueQueryFragment<table>;

type QueryFragments<tables extends Tables> = QueryFragment<tables[keyof tables]>[];

export function Has<table extends Table>(table: table): HasQueryFragment<table> {
  return { type: QueryFragmentType.Has, table };
}

export function Not<table extends Table>(table: table): NotQueryFragment<table> {
  return { type: QueryFragmentType.Not, table };
}

export function HasValue<table extends Table>(
  table: table,
  value: SchemaToPrimitives<table["valueSchema"]>,
): HasValueQueryFragment<table> {
  return { type: QueryFragmentType.HasValue, table, value };
}

export function NotValue<table extends Table>(
  table: table,
  value: SchemaToPrimitives<table["valueSchema"]>,
): NotValueQueryFragment<table> {
  return { type: QueryFragmentType.NotValue, table, value };
}

function fragmentsToQuerySubjects<tables extends Tables>(
  fragments: QueryFragment<tables[keyof tables]>[],
): QuerySubjects<tables> {
  return Object.fromEntries(
    fragments.map((fragment) => [
      // TODO: change this to table.name
      hexToResource(fragment.table.tableId).name,
      fragment.table.primaryKey,
    ]),
  ) as QuerySubjects<tables>;
}

function fragmentsToFrom<tables extends Tables>(
  fragments: QueryFragment<tables[keyof tables]>[],
): QuerySubjects<tables> {
  return fragmentsToQuerySubjects(
    fragments.filter(
      (fragment) =>
        fragment.type === QueryFragmentType.Has ||
        fragment.type === QueryFragmentType.HasValue ||
        fragment.type === QueryFragmentType.NotValue,
    ),
  );
}

function fragmentsToExcept<tables extends Tables>(
  fragments: QueryFragment<tables[keyof tables]>[],
): QuerySubjects<tables> {
  return fragmentsToQuerySubjects(fragments.filter((fragment) => fragment.type === QueryFragmentType.Not));
}

function fragmentToQueryConditions<tables extends Tables>(
  fragment: QueryFragment<tables[keyof tables]>,
): readonly queryConditions<tables>[] {
  const { value } = fragment as HasValueQueryFragment<Table> | NotValueQueryFragment<Table>;
  return Object.entries(value).map(([field, right]) => {
    if (fragment.type === QueryFragmentType.HasValue) {
      return [`${hexToResource(fragment.table.tableId).name}.${field}`, "=", right];
    } else {
      return [`${hexToResource(fragment.table.tableId).name}.${field}`, "!=", right];
    }
  }) as unknown as readonly queryConditions<tables>[];
}

function fragmentsToWhere<tables extends Tables>(
  fragments: QueryFragment<tables[keyof tables]>[],
): readonly queryConditions<tables>[] {
  return fragments
    .filter((fragment) => fragment.type === QueryFragmentType.HasValue || fragment.type === QueryFragmentType.NotValue)
    .map(fragmentToQueryConditions)
    .flat();
}

function subjectToEntity(subject: SubjectRecords): Entity {
  // ECS uses the entire primary key, so all records for a given subject have the same key tuple
  return hexKeyTupleToEntity(subject.records[0].keyTuple);
}

export async function runQuery<store extends QueryCacheStore, fragments extends QueryFragments<extractTables<store>>>(
  store: store,
  fragments: fragments,
): Promise<Set<Entity>> {
  const from = fragmentsToFrom(fragments);
  const except = fragmentsToExcept(fragments);
  const where = fragmentsToWhere(fragments);

  const { subjects } = await query(store, { from, except, where });

  const entities = subjects.map(subjectToEntity);

  return new Set(entities);
}
