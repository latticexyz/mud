import { mapObject } from "@latticexyz/common/utils";
import { resolveStore, validateStore, extendedScope } from "./store";
import {
  isTableShorthandInput,
  shorthandToTableInput,
  expandShorthandTables,
  validateShorthandTables,
} from "./tableShorthand";
import { hasOwnKey, isObject } from "./generics";
import { StoreWithShorthandsInput } from "./input";

export type validateStoreWithShorthands<store> = {
  [key in keyof store]: key extends "tables"
    ? validateShorthandTables<store[key], extendedScope<store>>
    : validateStore<store>[key];
};

export function validateStoreWithShorthands(store: unknown): asserts store is StoreWithShorthandsInput {
  const scope = extendedScope(store);
  if (hasOwnKey(store, "tables") && isObject(store.tables)) {
    validateShorthandTables(store.tables, scope);
  }
}

export type resolveStoreWithShorthands<store> = resolveStore<{
  [key in keyof store]: key extends "tables" ? expandShorthandTables<store[key], extendedScope<store>> : store[key];
}>;

export function resolveStoreWithShorthands<const store extends StoreWithShorthandsInput>(
  store: store,
): resolveStoreWithShorthands<store> {
  const scope = extendedScope(store);
  const tables = store.tables
    ? mapObject(store.tables, (table) => {
        return isTableShorthandInput(table) ? shorthandToTableInput(table, scope) : table;
      })
    : null;

  const fullConfig = {
    ...store,
    ...(tables ? { tables } : null),
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
