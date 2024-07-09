import { ErrorMessage, flatMorph } from "@arktype/util";
import { hasOwnKey, mergeIfUndefined, truncate } from "./generics";
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

export type resolveNamespace<input, scope extends Scope = AbiTypeScope> = input extends NamespaceInput
  ? {
      readonly label: input["label"];
      readonly namespace: undefined extends input["namespace"] ? truncate<input["label"], 14> : input["namespace"];
      readonly tables: undefined extends input["tables"]
        ? {}
        : resolveTables<
            {
              [label in keyof input["tables"]]: mergeIfUndefined<
                input["tables"][label],
                { label: label; namespace: input["namespace"] }
              >;
            },
            scope
          >;
    }
  : never;

export function resolveNamespace<const input extends NamespaceInput, scope extends Scope = AbiTypeScope>(
  input: input,
  scope: scope,
): resolveNamespace<input, scope> {
  const label = input.label;
  const namespace = input.namespace ?? label.slice(0, 14);
  return {
    label,
    namespace,
    tables: resolveTables(
      flatMorph(input.tables ?? {}, (label, table) => {
        return [label, mergeIfUndefined(table, { label, namespace })];
      }),
      scope,
    ),
  } as never;
}
