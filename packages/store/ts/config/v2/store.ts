import { ErrorMessage, evaluate, narrow } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { StoreInput } from "./input";
import { validateTables } from "./tables";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { mapEnums, resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";
import { resolveNamespace, validateNamespace } from "./namespace";
import { resolveTable } from "./table";
import { resolveNamespacedTables } from "./namespacedTables";

export type extendedScope<input> = scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>;

export function extendedScope<input>(input: input): extendedScope<input> {
  return scopeWithEnums(get(input, "enums"), scopeWithUserTypes(get(input, "userTypes")));
}

// Ideally we'd be able to use an intersection of `validateNamespace<input> & { key in keyof input]: ... }`
// to avoid duplicating logic, but TS doesn't work well when mapping over types like that.
// TODO: fill in more reasons why
export type validateStore<input> = {
  [key in keyof input]: key extends "tables"
    ? validateTables<input[key], extendedScope<input>>
    : key extends "userTypes"
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

export type resolveStore<
  input,
  namespace = "namespace" extends keyof input ? input["namespace"] : CONFIG_DEFAULTS["namespace"],
> = {
  readonly namespace: namespace;
  readonly tables: "tables" extends keyof input
    ? resolveNamespacedTables<
        {
          [label in keyof input["tables"]]: resolveTable<
            mergeIfUndefined<input["tables"][label], { namespace: namespace; label: label }>,
            extendedScope<input>
          >;
        },
        namespace
      >
    : {};
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
  const namespace = input.namespace ?? CONFIG_DEFAULTS.namespace;

  const { tables } = resolveNamespace(
    {
      label: namespace,
      namespace,
      tables: input.tables,
    },
    scope,
  );

  return {
    namespace,
    tables: resolveNamespacedTables(tables, namespace),
    sourceDirectory: input.sourceDirectory ?? CONFIG_DEFAULTS["sourceDirectory"],
    userTypes: input.userTypes ?? {},
    enums: resolveEnums(input.enums ?? {}),
    enumValues: mapEnums(input.enums ?? {}),
    codegen: resolveCodegen(input.codegen),
  } as never;
}

export function defineStore<const input>(input: validateStore<input>): evaluate<resolveStore<input>> {
  validateStore(input);
  return resolveStore(input) as never;
}
