import { evaluate, narrow } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { StoreInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";
import { namespacedTableKeys } from "./namespaces";

export type extendedScope<input> = scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>;

export function extendedScope<input>(input: input): extendedScope<input> {
  return scopeWithEnums(get(input, "enums"), scopeWithUserTypes(get(input, "userTypes")));
}

export type validateStore<store> = {
  [key in keyof store]: key extends "tables"
    ? validateTables<store[key], extendedScope<store>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<store[key]>
        : key extends keyof StoreInput
          ? StoreInput[key]
          : never;
};

export function validateStore(store: unknown): asserts store is StoreInput {
  const scope = extendedScope(store);
  if (hasOwnKey(store, "tables")) {
    validateTables(store.tables, scope);
  }

  if (hasOwnKey(store, "userTypes")) {
    validateUserTypes(store.userTypes);
  }
}

export type resolveStore<store> = evaluate<{
  readonly tables: "tables" extends keyof store
    ? resolveTables<
        {
          [key in namespacedTableKeys<store>]: key extends `${string}__${infer table}`
            ? mergeIfUndefined<get<get<store, "tables">, table>, { namespace: get<store, "namespace">; name: table }>
            : mergeIfUndefined<get<get<store, "tables">, key>, { namespace: get<store, "namespace">; name: key }>;
        },
        extendedScope<store>
      >
    : {};
  readonly userTypes: "userTypes" extends keyof store ? store["userTypes"] : {};
  readonly enums: "enums" extends keyof store ? resolveEnums<store["enums"]> : {};
  readonly namespace: "namespace" extends keyof store ? store["namespace"] : (typeof CONFIG_DEFAULTS)["namespace"];
  readonly codegen: "codegen" extends keyof store ? resolveCodegen<store["codegen"]> : resolveCodegen<{}>;
}>;

export function resolveStore<const store>(store: store): resolveStore<store> {
  validateStore(store);

  return {
    tables: resolveTables(
      Object.fromEntries(
        Object.entries(store.tables ?? {}).map(([tableKey, table]) => {
          const key = store.namespace ? `${store.namespace}__${tableKey}` : tableKey;
          return [key, mergeIfUndefined(table, { namespace: store.namespace, name: tableKey })];
        }),
      ),
      extendedScope(store),
    ),
    userTypes: store.userTypes ?? {},
    enums: store.enums ?? {},
    namespace: store.namespace ?? CONFIG_DEFAULTS["namespace"],
    codegen: resolveCodegen(store.codegen),
  } as unknown as resolveStore<store>;
}

export function defineStore<const store>(store: validateStore<store>): resolveStore<store> {
  return resolveStore(store) as unknown as resolveStore<store>;
}
