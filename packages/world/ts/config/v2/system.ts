import { SYSTEM_DEFAULTS } from "./defaults";
import { SystemInput } from "./input";
import { hasOwnKey, mergeIfUndefined } from "@latticexyz/store/config/v2";
import { ErrorMessage, narrow, requiredKeyOf } from "@ark/util";
import { Hex } from "viem";
import { resourceToHex } from "@latticexyz/common";

export type ValidateSystemOptions = { readonly inNamespace?: true };

export type requiredSystemKey<inNamespace extends true | undefined> = Exclude<
  requiredKeyOf<SystemInput>,
  inNamespace extends true ? "label" | "namespace" : never
>;

export type validateSystem<input, options extends ValidateSystemOptions = {}> = {
  [key in keyof input | requiredSystemKey<options["inNamespace"]>]: key extends keyof SystemInput
    ? key extends "label" | "namespace"
      ? options["inNamespace"] extends true
        ? ErrorMessage<"Overrides of `label` and `namespace` are not allowed for systems in this context.">
        : key extends keyof input
          ? narrow<input[key]>
          : never
      : SystemInput[key]
    : ErrorMessage<`Key \`${key & string}\` does not exist in SystemInput`>;
};

export function validateSystem<input>(
  input: input,
  options: ValidateSystemOptions = {},
): asserts input is SystemInput & input {
  if (typeof input !== "object" || input == null) {
    throw new Error(`Expected full system config, got \`${JSON.stringify(input)}\``);
  }

  if (options.inNamespace && (hasOwnKey(input, "label") || hasOwnKey(input, "namespace"))) {
    throw new Error("Overrides of `label` and `namespace` are not allowed for systems in this context.");
  }

  if (hasOwnKey(input, "namespace") && typeof input.namespace === "string" && input.namespace.length > 14) {
    throw new Error(`System \`namespace\` must fit into a \`bytes14\`, but "${input.namespace}" is too long.`);
  }
  if (hasOwnKey(input, "name") && typeof input.name === "string" && input.name.length > 16) {
    throw new Error(`System \`name\` must fit into a \`bytes16\`, but "${input.name}" is too long.`);
  }
}

export type resolveSystem<input> = input extends SystemInput
  ? {
      readonly label: input["label"];
      readonly namespace: undefined extends input["namespace"] ? SYSTEM_DEFAULTS["namespace"] : input["namespace"];
      readonly name: string;
      readonly systemId: Hex;
      readonly registerFunctionSelectors: undefined extends input["registerFunctionSelectors"]
        ? SYSTEM_DEFAULTS["registerFunctionSelectors"]
        : input["registerFunctionSelectors"];
      readonly openAccess: undefined extends input["openAccess"] ? SYSTEM_DEFAULTS["openAccess"] : input["openAccess"];
      readonly accessList: undefined extends input["accessList"] ? SYSTEM_DEFAULTS["accessList"] : input["accessList"];
    }
  : never;

export function resolveSystem<input extends SystemInput>(input: input): resolveSystem<input> {
  const label = input.label;
  const namespace = input.namespace ?? SYSTEM_DEFAULTS.namespace;
  const name = input.name ?? label.slice(0, 16);
  const systemId = resourceToHex({ type: "system", namespace, name });

  return mergeIfUndefined(
    {
      ...input,
      label,
      namespace,
      name,
      systemId,
    },
    SYSTEM_DEFAULTS,
  ) as never;
}

export function defineSystem<input>(input: validateSystem<input>): resolveSystem<input> {
  validateSystem(input);
  return resolveSystem(input) as never;
}
