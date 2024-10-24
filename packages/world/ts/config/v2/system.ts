import { SYSTEM_DEFAULTS, SYSTEM_DEPLOY_DEFAULTS } from "./defaults";
import { SystemInput } from "./input";
import { hasOwnKey, mergeIfUndefined } from "@latticexyz/store/internal";
import { ErrorMessage, narrow, requiredKeyOf, show } from "@ark/util";
import { Hex } from "viem";
import { resourceToHex } from "@latticexyz/common";

export type ValidateSystemOptions = { readonly inNamespace?: true };

export type requiredSystemKey<inNamespace extends true | undefined> = Exclude<
  requiredKeyOf<SystemInput>,
  inNamespace extends true ? "label" | "namespaceLabel" | "namespace" : never
>;

export type validateSystem<input, options extends ValidateSystemOptions = {}> = {
  [key in keyof input | requiredSystemKey<options["inNamespace"]>]: key extends keyof SystemInput
    ? key extends "label" | "namespaceLabel" | "namespace"
      ? options["inNamespace"] extends true
        ? ErrorMessage<"Overrides of `label`, `namespaceLabel`, and `namespace` are not allowed for systems in this context.">
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

  if (
    options.inNamespace &&
    (hasOwnKey(input, "label") || hasOwnKey(input, "namespaceLabel") || hasOwnKey(input, "namespace"))
  ) {
    throw new Error(
      "Overrides of `label`, `namespaceLabel`, and `namespace` are not allowed for systems in this context.",
    );
  }

  if (
    hasOwnKey(input, "namespaceLabel") &&
    typeof input.namespaceLabel === "string" &&
    (!hasOwnKey(input, "namespace") || typeof input.namespace !== "string") &&
    input.namespaceLabel.length > 14
  ) {
    throw new Error(
      `System \`namespace\` defaults to \`namespaceLabel\`, but must fit into a \`bytes14\` and "${input.namespaceLabel}" is too long. Provide explicit \`namespace\` override.`,
    );
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
      readonly namespaceLabel: undefined extends input["namespaceLabel"]
        ? typeof SYSTEM_DEFAULTS.namespaceLabel
        : input["namespaceLabel"];
      readonly namespace: string;
      readonly name: string;
      readonly systemId: Hex;
      readonly openAccess: undefined extends input["openAccess"] ? SYSTEM_DEFAULTS["openAccess"] : input["openAccess"];
      readonly accessList: undefined extends input["accessList"] ? SYSTEM_DEFAULTS["accessList"] : input["accessList"];
      readonly deploy: show<
        mergeIfUndefined<undefined extends input["deploy"] ? {} : input["deploy"], SYSTEM_DEPLOY_DEFAULTS>
      >;
    }
  : never;

export function resolveSystem<input extends SystemInput>(input: input): resolveSystem<input> {
  const namespaceLabel = input.namespaceLabel ?? SYSTEM_DEFAULTS.namespaceLabel;
  // validate ensures this is length constrained
  const namespace = input.namespace ?? namespaceLabel;

  const label = input.label;
  const name = input.name ?? label.slice(0, 16);
  const systemId = resourceToHex({ type: "system", namespace, name });

  return mergeIfUndefined(
    {
      ...input,
      label,
      namespaceLabel,
      namespace,
      name,
      systemId,
      deploy: mergeIfUndefined(input.deploy ?? {}, SYSTEM_DEPLOY_DEFAULTS),
    },
    SYSTEM_DEFAULTS,
  ) as never;
}

export function defineSystem<input>(input: validateSystem<input>): resolveSystem<input> {
  validateSystem(input);
  return resolveSystem(input) as never;
}
