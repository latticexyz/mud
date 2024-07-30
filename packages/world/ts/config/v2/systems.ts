import { ErrorMessage } from "@ark/util";
import { isObject } from "@latticexyz/store/config/v2";
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

export type resolveSystems<systems extends SystemsInput, namespace extends string> = {
  [label in keyof systems]: resolveSystem<systems[label] & { label: label; namespace: namespace }>;
};

export function resolveSystems<systems extends SystemsInput, namespace extends string>(
  systems: systems,
  namespace: namespace,
): resolveSystems<systems, namespace> {
  return Object.fromEntries(
    Object.entries(systems).map(([label, system]) => {
      return [label, resolveSystem({ ...system, label, namespace })];
    }),
  ) as never;
}
