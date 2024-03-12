import { ZustandStore } from "../zustand";
import { AllTables } from "./common";
import { SchemaToPrimitives, StoreConfig, Table, Tables } from "@latticexyz/store";
import isEqual from "fast-deep-equal";

export enum QueryFragmentType {
  Has,
  HasValue,
}

type HasQueryFragment<T extends Table> = {
  type: QueryFragmentType.Has;
  tableId: T["tableId"];
};

type HasValueQueryFragment<T extends Table> = {
  type: QueryFragmentType.HasValue;
  tableId: T["tableId"];
  value: SchemaToPrimitives<T["valueSchema"]>;
};

export function Has(table: Table): HasQueryFragment<T> {
  return { type: QueryFragmentType.Has, tableId: table.tableId };
}

export function HasValue<T extends Table>(
  table: T,
  value: SchemaToPrimitives<T["valueSchema"]>,
): HasValueQueryFragment<T> {
  return { type: QueryFragmentType.HasValue, tableId: table.tableId, value };
}

type QueryFragment<T extends Table> = HasQueryFragment<T> | HasValueQueryFragment<T>;

type Query = QueryFragment<Table>[];

export async function query<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: Query,
): Promise<string[]> {
  const records = Object.values(store.getState().records);

  const initialMatches = records.filter((record) => record.table.tableId === query[0].tableId);

  const matches = query
    .reduce((matches, fragment) => {
      if (fragment.type === QueryFragmentType.Has) {
        return matches.filter((record) => record.table.tableId === fragment.tableId);
      } else if (fragment.type === QueryFragmentType.HasValue) {
        return matches.filter(
          (record) => record.table.tableId === fragment.tableId && isEqual(record.value, fragment.value),
        );
      }
      return matches;
    }, initialMatches)
    .map((record) => record.keyTuple.join(":"));

  return matches;
}
