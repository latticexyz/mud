import { ErrorMessage, flatMorph } from "@arktype/util";
import { get, hasOwnKey, mergeIfUndefined } from "./generics";
import { CONFIG_DEFAULTS } from "./defaults";
import { NamespaceInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { AbiTypeScope, Scope } from "./scope";

export type validateNamespace<input, scope extends Scope = AbiTypeScope> = {
  [key in keyof input]: key extends "tables"
    ? validateTables<input[key], scope>
    : key extends keyof NamespaceInput
      ? NamespaceInput[key]
      : ErrorMessage<`\`${key & string}\` is not a valid namespace config option.`>;
};

export function validateNamespace<scope extends Scope = AbiTypeScope>(
  input: unknown,
  scope: scope,
): asserts input is NamespaceInput {
  if (hasOwnKey(input, "namespace") && typeof input.namespace === "string" && input.namespace.length > 14) {
    throw new Error(`\`namespace\` must fit into a \`bytes14\`, but "${input.namespace}" is too long.`);
  }
  if (hasOwnKey(input, "tables")) {
    validateTables(input.tables, scope);
  }
}

export type resolveNamespace<input, scope extends Scope = AbiTypeScope> = {
  readonly namespace: "namespace" extends keyof input ? input["namespace"] : CONFIG_DEFAULTS["namespace"];
  readonly tables: "tables" extends keyof input
    ? resolveTables<
        {
          [label in keyof input["tables"]]: mergeIfUndefined<
            input["tables"][label],
            { label: label; namespace: get<input, "namespace"> }
          >;
        },
        scope
      >
    : {};
};

export function resolveNamespace<const input extends NamespaceInput, scope extends Scope = AbiTypeScope>(
  input: input,
  scope: scope,
): resolveNamespace<input, scope> {
  return {
    namespace: input.namespace ?? CONFIG_DEFAULTS["namespace"],
    tables: resolveTables(
      flatMorph(input.tables ?? {}, (label, table) => {
        const namespace = input.namespace;
        return [label, mergeIfUndefined(table, { label, namespace })];
      }),
      scope,
    ),
  } as never;
}
