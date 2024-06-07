import {
  Scope,
  AbiTypeScope,
  validateTables,
  isObject,
  hasOwnKey,
  resolveTable,
  mergeIfUndefined,
  extendedScope,
  getPath,
} from "@latticexyz/store/config/v2";
import { NamespaceInput, NamespacesInput } from "./input";
import { ErrorMessage, conform } from "@arktype/util";

export type namespacedTableKeys<world> = world extends { namespaces: infer namespaces }
  ? {
      [k in keyof namespaces]: namespaces[k] extends { tables: infer tables }
        ? `${k & string}__${keyof tables & string}`
        : never;
    }[keyof namespaces]
  : never;

export type validateNamespace<namespace, scope extends Scope = AbiTypeScope> = {
  readonly [key in keyof namespace]: key extends "tables"
    ? validateTables<namespace[key], scope>
    : key extends keyof NamespaceInput
      ? conform<namespace[key], NamespaceInput[key]>
      : ErrorMessage<`\`${key & string}\` is not a valid namespace config option.`>;
};

export function validateNamespace<scope extends Scope = AbiTypeScope>(
  namespace: unknown,
  scope: scope,
): asserts namespace is NamespaceInput {
  if (hasOwnKey(namespace, "tables")) {
    validateTables(namespace.tables, scope);
  }
}

export type validateNamespaces<namespaces, scope extends Scope = AbiTypeScope> = {
  [namespace in keyof namespaces]: validateNamespace<namespaces[namespace], scope>;
};

export function validateNamespaces<scope extends Scope = AbiTypeScope>(
  namespaces: unknown,
  scope: scope,
): asserts namespaces is NamespacesInput {
  if (!isObject(namespaces)) {
    throw new Error(`Expected namespaces, received ${JSON.stringify(namespaces)}`);
  }
  for (const namespace of Object.values(namespaces)) {
    validateNamespace(namespace, scope);
  }
}

export type resolveNamespacedTables<world> = "namespaces" extends keyof world
  ? {
      readonly [key in namespacedTableKeys<world>]: key extends `${infer namespace}__${infer table}`
        ? resolveTable<
            mergeIfUndefined<
              getPath<world, ["namespaces", namespace, "tables", table]>,
              { name: table; namespace: namespace }
            >,
            extendedScope<world>
          >
        : never;
    }
  : {};
