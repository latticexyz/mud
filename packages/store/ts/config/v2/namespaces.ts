import { evaluate, flatMorph } from "@arktype/util";
import { isObject, mergeIfUndefined } from "./generics";
import { NamespacesInput } from "./input";
import { AbiTypeScope, Scope } from "./scope";
import { validateNamespace, resolveNamespace } from "./namespace";

export type validateNamespaces<namespaces, scope extends Scope = AbiTypeScope> = {
  [label in keyof namespaces]: validateNamespace<namespaces[label], scope>;
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

export type resolveNamespaces<namespaces, scope extends Scope = AbiTypeScope> = evaluate<{
  readonly [label in keyof namespaces]: resolveNamespace<mergeIfUndefined<namespaces[label], { label: label }>, scope>;
}>;

export function resolveNamespaces<namespaces extends NamespacesInput, scope extends Scope = AbiTypeScope>(
  namespaces: namespaces,
  scope: scope,
): resolveNamespaces<namespaces, scope> {
  if (!isObject(namespaces)) {
    throw new Error(`Expected namespaces config, received ${JSON.stringify(namespaces)}`);
  }

  return flatMorph(namespaces as NamespacesInput, (label, namespace) => [
    label,
    resolveNamespace(mergeIfUndefined(namespace, { label }), scope),
  ]) as never;
}
