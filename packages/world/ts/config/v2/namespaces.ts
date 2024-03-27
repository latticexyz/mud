import {
  Scope,
  AbiTypeScope,
  validateTables,
  isObject,
  hasOwnKey,
  resolveTable,
  mergeIfUndefined,
  get,
  extendedScope,
} from "@latticexyz/store/config/v2";
import { NamespacesInput } from "./input";

export type namespacedTableKeys<world> = "namespaces" extends keyof world
  ? "tables" extends keyof world["namespaces"][keyof world["namespaces"]]
    ? `${keyof world["namespaces"] & string}__${keyof world["namespaces"][keyof world["namespaces"]]["tables"] &
        string}`
    : never
  : never;

export type validateNamespaces<namespaces, scope extends Scope = AbiTypeScope> = {
  [namespace in keyof namespaces]: {
    [key in keyof namespaces[namespace]]: key extends "tables"
      ? validateTables<namespaces[namespace][key], scope>
      : namespaces[namespace][key];
  };
};

export function validateNamespaces<scope extends Scope = AbiTypeScope>(
  namespaces: unknown,
  scope: scope,
): asserts namespaces is NamespacesInput {
  if (isObject(namespaces)) {
    for (const namespace of Object.values(namespaces)) {
      if (!hasOwnKey(namespace, "tables")) {
        throw new Error(`Expected namespace config, received ${JSON.stringify(namespace)}`);
      }
      validateTables(namespace.tables, scope);
    }
    return;
  }
  throw new Error(`Expected namespaces config, received ${JSON.stringify(namespaces)}`);
}

export type resolveNamespacedTables<world> = "namespaces" extends keyof world
  ? {
      readonly [key in namespacedTableKeys<world>]: key extends `${infer namespace}__${infer table}`
        ? resolveTable<
            mergeIfUndefined<
              get<get<get<get<world, "namespaces">, namespace>, "tables">, table>,
              { name: table; namespace: namespace }
            >,
            extendedScope<world>
          >
        : never;
    }
  : {};
