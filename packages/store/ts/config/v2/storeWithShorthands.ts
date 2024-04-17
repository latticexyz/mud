import { mapObject } from "@latticexyz/common/utils";
import { resolveStore, validateStore, extendedScope } from "./store";
import {
  isTableShorthandInput,
  resolveTableShorthand,
  resolveTablesWithShorthands,
  validateTablesWithShorthands,
} from "./tableShorthand";
import { hasOwnKey, isObject } from "./generics";
import { StoreWithShorthandsInput } from "./input";

export type validateStoreWithShorthands<store> = {
  [key in keyof store]: key extends "tables"
    ? validateTablesWithShorthands<store[key], extendedScope<store>>
    : validateStore<store>[key];
};

export function validateStoreWithShorthands(store: unknown): asserts store is StoreWithShorthandsInput {
  const scope = extendedScope(store);
  if (hasOwnKey(store, "tables") && isObject(store.tables)) {
    validateTablesWithShorthands(store.tables, scope);
  }
}

export type resolveStoreWithShorthands<store> = resolveStore<{
  [key in keyof store]: key extends "tables"
    ? resolveTablesWithShorthands<store[key], extendedScope<store>>
    : store[key];
}>;

export function resolveStoreWithShorthands<const store extends StoreWithShorthandsInput>(
  store: store,
): resolveStoreWithShorthands<store> {
  const scope = extendedScope(store);
  const fullConfig = {
    ...store,
    tables: mapObject(store.tables, (table) => {
      return isTableShorthandInput(table) ? resolveTableShorthand(table, scope) : table;
    }),
  };

  validateStore(fullConfig);
  return resolveStore(fullConfig) as never;
}

export function defineStoreWithShorthands<const store>(
  store: validateStoreWithShorthands<store>,
): resolveStoreWithShorthands<store> {
  validateStoreWithShorthands(store);
  return resolveStoreWithShorthands(store) as never;
}
