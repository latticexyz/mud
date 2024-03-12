import { ZustandStore } from "../zustand";
import { AllTables } from "./common";
import { SchemaToPrimitives, StoreConfig, Table, Tables } from "@latticexyz/store";
import { query } from "./query";

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

export async function queryRECS<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  fragments: QueryFragment<Table>[],
): Promise<string[]> {
  const from = fragments.map((fragment) => ({ tableId: fragment.tableId, subject: ["player"] }));
  const where = fragments
    .filter((fragment) => fragment.type === QueryFragmentType.HasValue)
    .map((fragment) =>
      Object.entries((fragment as HasValueQueryFragment<Table>).value).map(([field, right]) => ({
        left: { tableId: fragment.tableId, field },
        op: "=",
        right,
      })),
    )
    .flat();

  const result = await query(store, {
    from,
    where,
  });

  return result.map((result) => result.join(":"));
}
