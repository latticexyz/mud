import { ErrorMessage, show, flatMorph, narrow } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { StoreInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { mapEnums, resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";
import { resolveNamespacedTables } from "./namespacedTables";
import { resolveTable } from "./table";

export type extendedScope<input> = scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>;

export function extendedScope<input>(input: input): extendedScope<input> {
  return scopeWithEnums(get(input, "enums"), scopeWithUserTypes(get(input, "userTypes")));
}

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
  if (hasOwnKey(input, "tables")) {
    validateTables(input.tables, scope);
  }

  if (hasOwnKey(input, "userTypes")) {
    validateUserTypes(input.userTypes);
  }
}

export type resolveStore<
  input,
  namespace = "namespace" extends keyof input ? input["namespace"] : CONFIG_DEFAULTS["namespace"],
> = {
  readonly namespace: namespace;
  readonly sourceDirectory: "sourceDirectory" extends keyof input
    ? input["sourceDirectory"]
    : CONFIG_DEFAULTS["sourceDirectory"];
  readonly tables: "tables" extends keyof input
    ? resolveNamespacedTables<
        {
          readonly [label in keyof input["tables"]]: resolveTable<
            mergeIfUndefined<input["tables"][label], { label: label; namespace: namespace }>,
            extendedScope<input>
          >;
        },
        namespace
      >
    : {};
  readonly userTypes: "userTypes" extends keyof input ? input["userTypes"] : {};
  readonly enums: "enums" extends keyof input ? show<resolveEnums<input["enums"]>> : {};
  readonly enumValues: "enums" extends keyof input ? show<mapEnums<input["enums"]>> : {};
  readonly codegen: "codegen" extends keyof input ? resolveCodegen<input["codegen"]> : resolveCodegen<{}>;
};

export function resolveStore<const input extends StoreInput>(input: input): resolveStore<input> {
  const scope = extendedScope(input);
  const namespace = input.namespace ?? CONFIG_DEFAULTS["namespace"];
  const codegen = resolveCodegen(input.codegen);

  const tables = resolveTables(
    flatMorph(input.tables ?? {}, (label, table) => {
      return [
        label,
        {
          ...table,
          label,
          namespace,
          codegen: {
            ...table.codegen,
            outputDirectory:
              table.codegen?.outputDirectory ??
              (codegen.namespaceDirectories && namespace !== "" ? `${namespace}/tables` : "tables"),
          },
        },
      ];
    }),
    scope,
  );

  return {
    namespace,
    sourceDirectory: input.sourceDirectory ?? CONFIG_DEFAULTS["sourceDirectory"],
    tables: resolveNamespacedTables(tables, namespace),
    userTypes: input.userTypes ?? {},
    enums: resolveEnums(input.enums ?? {}),
    enumValues: mapEnums(input.enums ?? {}),
    codegen,
  } as never;
}

export function defineStore<const input>(input: validateStore<input>): show<resolveStore<input>> {
  validateStore(input);
  return resolveStore(input) as never;
}
