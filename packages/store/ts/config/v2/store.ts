import { evaluate, narrow } from "@arktype/util";
import { get, hasOwnKey, isObject, mergeIfUndefined } from "./generics";
import { validateTable } from "./table";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { mapObject } from "@latticexyz/common/utils";
import { StoreInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { scopeWithUserTypes } from "./userTypes";
import { resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";

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
  if (hasOwnKey(store, "tables") && isObject(store.tables)) {
    for (const key of Object.keys(store.tables)) {
      validateTable(get(store.tables, key), scope);
    }
  }
}

export type resolveStore<store> = evaluate<{
  readonly tables: "tables" extends keyof store
    ? resolveTables<
        {
          [key in keyof store["tables"]]: mergeIfUndefined<
            store["tables"][key],
            { namespace: get<store, "namespace"> }
          >;
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
      mapObject(store.tables ?? {}, (table) => mergeIfUndefined(table, { namespace: store.namespace })),
      extendedScope(store),
    ),
    userTypes: store.userTypes ?? {},
    enums: store.enums ?? {},
    namespace: store.namespace ?? CONFIG_DEFAULTS["namespace"],
    codegen: resolveCodegen(store.codegen),
  } as unknown as resolveStore<store>;
}

export function defineStore<const store>(store: validateStore<store>): resolveStore<store> {
  return resolveStore(store) as resolveStore<store>;
}
