import { ErrorMessage, evaluate, narrow } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { NamespaceInput, StoreInput } from "./input";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { mapEnums, resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";
import { resolveNamespace, validateNamespace } from "./namespace";

export type extendedScope<input> = scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>;

export function extendedScope<input>(input: input): extendedScope<input> {
  return scopeWithEnums(get(input, "enums"), scopeWithUserTypes(get(input, "userTypes")));
}

export type validateStore<input> = (input extends NamespaceInput
  ? validateNamespace<Pick<input, keyof NamespaceInput>, extendedScope<input>>
  : {}) & {
  [key in keyof input]: key extends "userTypes"
    ? UserTypes
    : key extends "enums"
      ? narrow<input[key]>
      : key extends keyof StoreInput
        ? StoreInput[key]
        : ErrorMessage<`\`${key & string}\` is not a valid Store config option.`>;
};

export function validateStore(input: unknown): asserts input is StoreInput {
  const scope = extendedScope(input);
  validateNamespace(input, scope);

  if (hasOwnKey(input, "userTypes")) {
    validateUserTypes(input.userTypes);
  }
}

export type resolveStore<input> = resolveNamespace<
  mergeIfUndefined<input, { label: CONFIG_DEFAULTS["namespace"] }>,
  extendedScope<input>
> & {
  readonly sourceDirectory: "sourceDirectory" extends keyof input
    ? input["sourceDirectory"]
    : CONFIG_DEFAULTS["sourceDirectory"];
  readonly userTypes: "userTypes" extends keyof input ? input["userTypes"] : {};
  readonly enums: "enums" extends keyof input ? evaluate<resolveEnums<input["enums"]>> : {};
  readonly enumValues: "enums" extends keyof input ? evaluate<mapEnums<input["enums"]>> : {};
  readonly codegen: "codegen" extends keyof input ? resolveCodegen<input["codegen"]> : resolveCodegen<{}>;
};

export function resolveStore<const input extends StoreInput>(input: input): resolveStore<input> {
  const scope = extendedScope(input);
  const namespace = resolveNamespace(mergeIfUndefined(input, { label: CONFIG_DEFAULTS.namespace }), scope);
  return {
    ...namespace,
    sourceDirectory: input.sourceDirectory ?? CONFIG_DEFAULTS["sourceDirectory"],
    userTypes: input.userTypes ?? {},
    enums: resolveEnums(input.enums ?? {}),
    enumValues: mapEnums(input.enums ?? {}),
    codegen: resolveCodegen(input.codegen),
  } as never;
}

export function defineStore<const input>(input: validateStore<input>): resolveStore<input> {
  validateStore(input);
  return resolveStore(input) as never;
}
