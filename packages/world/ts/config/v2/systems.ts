import { ErrorMessage } from "@ark/util";
import { isObject } from "@latticexyz/store/internal";
import { SystemsInput } from "./input";
import { resolveSystem, validateSystem } from "./system";

// TODO: add nuance between "in namespace" (namespace provided in context) and "in systems" (label provided in context)

export type validateSystems<input> = {
  [label in keyof input]: input[label] extends object
    ? validateSystem<input[label], { inNamespace: true }>
    : ErrorMessage<`Expected a system config for ${label & string}.`>;
};

export function validateSystems(input: unknown): asserts input is SystemsInput {
  if (isObject(input)) {
    for (const system of Object.values(input)) {
      validateSystem(system, { inNamespace: true });
    }
    return;
  }
  throw new Error(`Expected system config, received ${JSON.stringify(input)}`);
}

export type resolveSystems<systems extends SystemsInput, namespaceLabel extends string> = {
  [label in keyof systems]: resolveSystem<
    systems[label] & { label: label; namespaceLabel: namespaceLabel; namespace: string }
  >;
};

export function resolveSystems<systems extends SystemsInput, namespaceLabel extends string>(
  systems: systems,
  namespaceLabel: namespaceLabel,
  namespace: string,
): resolveSystems<systems, namespaceLabel> {
  return Object.fromEntries(
    Object.entries(systems).map(([label, system]) => {
      return [label, resolveSystem({ ...system, label, namespaceLabel, namespace })];
    }),
  ) as never;
}
