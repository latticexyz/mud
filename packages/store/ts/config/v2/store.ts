import { ErrorMessage, evaluate, narrow, satisfy } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { Namespace, Store, UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { NamespaceInput, StoreInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { mapEnums, resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";
import { resolveNamespace, validateNamespace } from "./namespace";
import { resolveNamespaces, validateNamespaces } from "./namespaces";

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
        : key extends "namespaces"
          ? input extends { [k in keyof NamespaceInput]?: unknown }
            ? ErrorMessage<"Cannot use `namespaces` key with `namespace`, `tables` keys.">
            : validateNamespaces<StoreInput[key]>
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

  if (hasOwnKey(input, "namespaces")) {
    if (hasOwnKey(input, "namespace") || hasOwnKey(input, "tables")) {
      throw new Error("Cannot use `namespaces` key with `namespace`, `tables` keys.");
    }
    validateNamespaces(input.namespaces, scope);
  }
}

type resolveBaseNamespace<input> = resolveNamespace<
  {
    label: "namespace" extends keyof input ? input["namespace"] : CONFIG_DEFAULTS["namespace"];
    namespace: "namespace" extends keyof input ? input["namespace"] : CONFIG_DEFAULTS["namespace"];
    tables: "tables" extends keyof input ? input["tables"] : {};
  },
  extendedScope<input>
>;

// export type resolveStore<input> = input extends StoreInput
//   ? ("namespaces" extends keyof input
//       ? {
//           readonly multipleNamespaces: true;
//           readonly namespaces: resolveNamespaces<input["namespaces"], extendedScope<input>>;
//         } & {
//           readonly [key in keyof Namespace]: undefined;
//         }
//       : {
//           readonly multipleNamespaces: false;
//           readonly namespaces: resolveNamespaces<
//             { [key in resolveBaseNamespace<input>["label"]]: resolveBaseNamespace<input> },
//             extendedScope<input>
//           >;
//           // TODO: add flattened/namespace-prefixed tables for backwards compat
//         } & resolveBaseNamespace<input>) & {
//       readonly sourceDirectory: "sourceDirectory" extends keyof input
//         ? input["sourceDirectory"]
//         : CONFIG_DEFAULTS["sourceDirectory"];
//       readonly userTypes: "userTypes" extends keyof input ? input["userTypes"] : {};
//       readonly enums: "enums" extends keyof input ? evaluate<resolveEnums<input["enums"]>> : {};
//       readonly enumValues: "enums" extends keyof input ? evaluate<mapEnums<input["enums"]>> : {};
//       readonly codegen: "codegen" extends keyof input ? resolveCodegen<input["codegen"]> : resolveCodegen<{}>;
//     }
//   : never;

export type resolveStore<input> = {
  readonly multipleNamespaces: "namespaces" extends keyof input ? true : false;
  readonly namespaces: resolveNamespaces<
    "namespaces" extends keyof input
      ? input["namespaces"]
      : { [key in resolveBaseNamespace<input>["label"]]: resolveBaseNamespace<input> },
    extendedScope<input>
  >;
  readonly label: "namespaces" extends keyof input
    ? undefined
    : "namespace" extends keyof input
      ? input["namespace"]
      : CONFIG_DEFAULTS["namespace"];
  readonly namespace: "namespaces" extends keyof input
    ? undefined
    : "namespace" extends keyof input
      ? input["namespace"]
      : CONFIG_DEFAULTS["namespace"];
  readonly tables: "namespaces" extends keyof input
    ? undefined
    : "tables" extends keyof input
      ? resolveTables<input["tables"], extendedScope<input>>
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

  const store = {
    sourceDirectory: input.sourceDirectory ?? CONFIG_DEFAULTS["sourceDirectory"],
    userTypes: input.userTypes ?? {},
    enums: resolveEnums(input.enums ?? {}),
    enumValues: mapEnums(input.enums ?? {}),
    codegen: resolveCodegen(input.codegen),
  };

  if (input.namespaces) {
    return {
      ...store,
      multipleNamespaces: true,
      namespaces: resolveNamespaces(input.namespaces, scope),
      label: undefined,
      namespace: undefined,
      tables: undefined,
    } as never;
  }

  const namespace = input.namespace ?? CONFIG_DEFAULTS.namespace;
  const label = namespace;
  const baseNamespace = resolveNamespace({ ...input, namespace, label }, scope);
  return {
    ...store,
    multipleNamespaces: false,
    ...baseNamespace,
    namespaces: {
      [baseNamespace.label]: baseNamespace,
    },
  } as never;
}

export function defineStore<const input>(input: validateStore<input>): resolveStore<input> {
  validateStore(input);
  return resolveStore(input) as never;
}
