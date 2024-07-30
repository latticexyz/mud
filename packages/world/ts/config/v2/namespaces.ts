import { show, flatMorph } from "@ark/util";
import { NamespacesInput } from "./input";
import { validateNamespace, resolveNamespace } from "./namespace";
import { groupBy } from "@latticexyz/common/utils";
import { AbiTypeScope, Scope, isObject, mergeIfUndefined } from "@latticexyz/store/config/v2";

// Copied from store/ts/config/v2/namespaces.ts but using world namespace validate/resolve methods
// TODO: figure out how to dedupe these?

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

export type resolveNamespaces<namespaces, scope extends Scope = AbiTypeScope> = {
  readonly [label in keyof namespaces]: resolveNamespace<mergeIfUndefined<namespaces[label], { label: label }>, scope>;
};

export function resolveNamespaces<input extends NamespacesInput, scope extends Scope = AbiTypeScope>(
  input: input,
  scope: scope,
): show<resolveNamespaces<input, scope>> {
  if (!isObject(input)) {
    throw new Error(`Expected namespaces config, received ${JSON.stringify(input)}`);
  }

  const namespaces = flatMorph(input as NamespacesInput, (label, namespace) => [
    label,
    resolveNamespace(mergeIfUndefined(namespace, { label }), scope),
  ]);

  // This should probably be in `validate`, but `namespace` gets set during the resolve step above, so it's easier to validate here.
  const duplicates = Array.from(groupBy(Object.values(namespaces), (namespace) => namespace.namespace).entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([namespace]) => namespace);
  if (duplicates.length > 0) {
    throw new Error(`Found namespaces defined more than once in config: ${duplicates.join(", ")}`);
  }

  return namespaces as never;
}

export function defineNamespaces<input, scope extends Scope = AbiTypeScope>(
  input: validateNamespaces<input, scope>,
  scope: scope = AbiTypeScope as never,
): show<resolveNamespaces<input, scope>> {
  validateNamespaces(input, scope);
  return resolveNamespaces(input, scope) as never;
}
