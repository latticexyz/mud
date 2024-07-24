import { ErrorMessage, show, flatMorph, narrow } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { UserTypes } from "./output";
import { CONFIG_DEFAULTS } from "./defaults";
import { StoreInput, TableInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { scopeWithUserTypes, validateUserTypes } from "./userTypes";
import { mapEnums, resolveEnums, scopeWithEnums } from "./enums";
import { resolveCodegen } from "./codegen";
import { resolveNamespacedTables } from "./namespacedTables";
import { resolveTable } from "./table";
import { resolveNamespace } from "./namespace";
import { expandTableShorthand } from "./tableShorthand";

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

export type resolveStore<
  input,
  namespace = "namespace" extends keyof input
    ? input["namespace"] extends string
      ? input["namespace"]
      : CONFIG_DEFAULTS["namespace"]
    : CONFIG_DEFAULTS["namespace"],
> = {
  readonly namespace: string;
  readonly sourceDirectory: "sourceDirectory" extends keyof input
    ? input["sourceDirectory"]
    : CONFIG_DEFAULTS["sourceDirectory"];
  readonly tables: "tables" extends keyof input
    ? resolveNamespacedTables<
        {
          readonly [label in keyof input["tables"]]: resolveTable<
            mergeIfUndefined<expandTableShorthand<input["tables"][label]>, { label: label; namespace: namespace }>,
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
  readonly namespaces: {
    readonly [label in namespace & string]: resolveNamespace<
      {
        readonly label: label;
        readonly tables: "tables" extends keyof input ? input["tables"] : undefined;
      },
      extendedScope<input>
    >;
  };
};

export function resolveStore<const input extends StoreInput>(input: input): resolveStore<input> {
  const scope = extendedScope(input);
  const namespace = input.namespace ?? CONFIG_DEFAULTS["namespace"];
  const codegen = resolveCodegen(input.codegen);

  const tablesInput = flatMorph(input.tables ?? {}, (label, shorthand) => {
    const table = expandTableShorthand(shorthand, scope) as TableInput;
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
  });

  const namespaces = {
    [namespace]: resolveNamespace({ label: namespace, tables: tablesInput }, scope),
  };

  const tables = resolveTables(tablesInput, scope);

  return {
    namespace,
    tables: resolveNamespacedTables(tables, namespace),
    namespaces,
    sourceDirectory: input.sourceDirectory ?? CONFIG_DEFAULTS["sourceDirectory"],
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
