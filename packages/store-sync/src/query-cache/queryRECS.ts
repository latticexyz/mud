import { ZustandStore } from "../zustand";
import { AllTables } from "./common";
import { StoreConfig, Tables } from "@latticexyz/store";
import { Hex } from "viem";
import isEqual from "fast-deep-equal";

export enum QueryFragmentType {
  Has,
  HasValue,
}

type HasQueryFragment = {
  type: QueryFragmentType.Has;
  tableId: Hex;
};

type HasValueQueryFragment = {
  type: QueryFragmentType.HasValue;
  tableId: Hex;
  value: any;
};

export function Has(tableId: Hex): HasQueryFragment {
  return { type: QueryFragmentType.Has, tableId };
}

export function HasValue(tableId: Hex, value: any): HasValueQueryFragment {
  return { type: QueryFragmentType.HasValue, tableId, value };
}

type Query = HasQueryFragment[];

export async function query<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: Query,
): Promise<Hex> {
  const records = Object.values(store.getState().records);

  // const matches = records
  //   .filter((record) => query.map((fragment) => fragment.tableId).includes(record.table.tableId))
  //   .map((record) => record.keyTuple.join(":"));

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
    }, initialMatches)
    .map((record) => record.keyTuple.join(":"));

  return matches;
}
