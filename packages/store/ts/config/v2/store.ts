import { ErrorMessage, show, narrow } from "@ark/util";
import { get, hasOwnKey } from "./generics";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { StoreInput } from "./input";
import { validateTables } from "./tables";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { mapEnums, resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";
import { resolveNamespaces, validateNamespaces } from "./namespaces";
import { flattenNamespacedTables } from "./flattenNamespacedTables";

export type extendedScope<input> = scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>;

export function extendedScope<input>(input: input): extendedScope<input> {
  return scopeWithEnums(get(input, "enums"), scopeWithUserTypes(get(input, "userTypes")));
}

export type validateStore<input> = {
  [key in keyof input]: key extends "namespaces"
    ? input extends { namespace?: unknown; tables?: unknown }
      ? ErrorMessage<"Cannot use `namespaces` with `namespace` or `tables` keys.">
      : validateNamespaces<input[key], extendedScope<input>>
    : key extends "tables"
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

  if (hasOwnKey(input, "namespaces")) {
    if (hasOwnKey(input, "namespace") || hasOwnKey(input, "tables")) {
      throw new Error("Cannot use `namespaces` with `namespace` or `tables` keys.");
    }
    validateNamespaces(input.namespaces, scope);
  }

  if (hasOwnKey(input, "namespace") && typeof input.namespace === "string" && input.namespace.length > 14) {
    throw new Error(`\`namespace\` must fit into a \`bytes14\`, but "${input.namespace}" is too long.`);
  }

  if (hasOwnKey(input, "tables")) {
    validateTables(input.tables, scope);
  }

  if (hasOwnKey(input, "userTypes")) {
    validateUserTypes(input.userTypes);
  }
}

type resolveNamespaceMode<input> = "namespaces" extends keyof input
  ? {
      readonly multipleNamespaces: true;
      readonly namespace: null;
      readonly namespaces: resolveNamespaces<input["namespaces"], extendedScope<input>>;
    }
  : {
      readonly multipleNamespaces: false;
      readonly namespace: string;
      readonly namespaces: resolveNamespaces<
        {
          readonly [label in "namespace" extends keyof input
            ? input["namespace"] extends string
              ? input["namespace"]
              : CONFIG_DEFAULTS["namespace"]
            : CONFIG_DEFAULTS["namespace"]]: input;
        },
        extendedScope<input>
      >;
    };

export type resolveStore<input> = resolveNamespaceMode<input> & {
  readonly tables: flattenNamespacedTables<resolveNamespaceMode<input>>;
  readonly sourceDirectory: "sourceDirectory" extends keyof input
    ? input["sourceDirectory"]
    : CONFIG_DEFAULTS["sourceDirectory"];
  readonly userTypes: "userTypes" extends keyof input ? input["userTypes"] : {};
  readonly enums: "enums" extends keyof input ? show<resolveEnums<input["enums"]>> : {};
  readonly enumValues: "enums" extends keyof input ? show<mapEnums<input["enums"]>> : {};
  readonly codegen: "codegen" extends keyof input ? resolveCodegen<input["codegen"]> : resolveCodegen<{}>;
};

export function resolveStore<const input extends StoreInput>(input: input): resolveStore<input> {
  const scope = extendedScope(input);

  const baseNamespace = input.namespace ?? CONFIG_DEFAULTS["namespace"];
  const namespaces = input.namespaces
    ? ({
        multipleNamespaces: true,
        namespace: null,
        namespaces: resolveNamespaces(input.namespaces, scope),
      } as const)
    : ({
        multipleNamespaces: false,
        namespace: baseNamespace,
        namespaces: resolveNamespaces({ [baseNamespace]: input }, scope),
      } as const);

  const tables = flattenNamespacedTables(namespaces as never);

  return {
    ...namespaces,
    tables,
    sourceDirectory: input.sourceDirectory ?? CONFIG_DEFAULTS["sourceDirectory"],
    userTypes: input.userTypes ?? {},
    enums: resolveEnums(input.enums ?? {}),
    enumValues: mapEnums(input.enums ?? {}),
    codegen: resolveCodegen(input.codegen),
  } as never;
}

export function defineStore<const input>(input: validateStore<input>): show<resolveStore<input>> {
  validateStore(input);
  return resolveStore(input) as never;
}
