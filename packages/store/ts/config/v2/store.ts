import { ErrorMessage, show, flatMorph, narrow } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { StoreInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { mapEnums, resolveEnums, scopeWithEnums } from "./enums";
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
          : ErrorMessage<`\`${key & string}\` is not a valid Store config option.`>;
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

type keyPrefix<store> = store extends { namespace: infer namespace extends string }
  ? namespace extends ""
    ? ""
    : `${namespace}__`
  : "";

export type resolveStore<store> = {
  readonly sourceDirectory: "sourceDirectory" extends keyof store
    ? store["sourceDirectory"]
    : CONFIG_DEFAULTS["sourceDirectory"];
  readonly tables: "tables" extends keyof store
    ? resolveTables<
        {
          [tableKey in keyof store["tables"] & string as `${keyPrefix<store>}${tableKey}`]: mergeIfUndefined<
            store["tables"][tableKey],
            { namespace: get<store, "namespace">; name: tableKey }
          >;
        },
        extendedScope<store>
      >
    : {};
  readonly userTypes: "userTypes" extends keyof store ? store["userTypes"] : {};
  readonly enums: "enums" extends keyof store ? show<resolveEnums<store["enums"]>> : {};
  readonly enumValues: "enums" extends keyof store ? show<mapEnums<store["enums"]>> : {};
  readonly namespace: "namespace" extends keyof store ? store["namespace"] : CONFIG_DEFAULTS["namespace"];
  readonly codegen: "codegen" extends keyof store ? resolveCodegen<store["codegen"]> : resolveCodegen<{}>;
};

export function resolveStore<const store extends StoreInput>(store: store): resolveStore<store> {
  // TODO: default `namespaceDirectories` to true if using top-level `namespaces` key (once its migrated to store)
  const codegen = resolveCodegen(store.codegen);
  return {
    sourceDirectory: store.sourceDirectory ?? CONFIG_DEFAULTS["sourceDirectory"],
    tables: resolveTables(
      flatMorph(store.tables ?? {}, (name, table) => {
        const namespace = store.namespace;
        const key = namespace ? `${namespace}__${name}` : name;
        return [
          key,
          mergeIfUndefined(table, {
            namespace: namespace,
            name,
            codegen: mergeIfUndefined(table.codegen ?? {}, {
              outputDirectory: codegen.namespaceDirectories && namespace?.length ? `${namespace}/tables` : "tables",
            }),
          }),
        ];
      }),
      extendedScope(store),
    ),
    userTypes: store.userTypes ?? {},
    enums: resolveEnums(store.enums ?? {}),
    enumValues: mapEnums(store.enums ?? {}),
    namespace: store.namespace ?? CONFIG_DEFAULTS["namespace"],
    codegen,
  } as never;
}

export function defineStore<const store>(store: validateStore<store>): resolveStore<store> {
  validateStore(store);
  return resolveStore(store) as never;
}
