import { ZustandStore } from "../../zustand";
import { AllTables } from "../common";
import { StoreConfig, Table, Tables } from "@latticexyz/store";
import {
  ComponentUpdate,
  QueryFragment,
  defineEnterQuery,
  defineExitQuery,
  defineQuery,
  defineUpdateQuery,
} from "./Query";
import { Observable, map } from "rxjs";
import { UpdateType } from "@latticexyz/recs";

export function defineRxSystem<T>(observable$: Observable<T>, system: (event: T) => void): void {
  observable$.subscribe(system);
}

export async function defineSystem<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: QueryFragment<Table>[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void,
): Promise<void> {
  const { update$ } = await defineQuery(store, query);
  defineRxSystem(update$.pipe(map((updates) => updates[0])), system);
}

export async function defineUpdateSystem<
  config extends StoreConfig,
  extraTables extends Tables | undefined = undefined,
>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: QueryFragment<Table>[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void,
): Promise<void> {
  const update$ = await defineUpdateQuery(store, query);
  defineRxSystem(update$.pipe(map((updates) => updates)), system);
}

export async function defineEnterSystem<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: QueryFragment<Table>[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void,
): Promise<void> {
  const update$ = await defineEnterQuery(store, query);
  defineRxSystem(update$.pipe(map((updates) => updates)), system);
}

export async function defineExitSystem<config extends StoreConfig, extraTables extends Tables | undefined = undefined>(
  store: ZustandStore<AllTables<config, extraTables>>,
  query: QueryFragment<Table>[],
  system: (update: ComponentUpdate & { type: UpdateType }) => void,
): Promise<void> {
  const update$ = await defineExitQuery(store, query);
  defineRxSystem(update$.pipe(map((updates) => updates)), system);
}
