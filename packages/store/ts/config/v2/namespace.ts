import { ErrorMessage, flatMorph } from "@ark/util";
import { hasOwnKey, mergeIfUndefined } from "./generics";
import { NamespaceInput } from "./input";
import { resolveTables, validateTables } from "./tables";
import { AbiTypeScope, Scope } from "./scope";
import { expandTableShorthand } from "./tableShorthand";

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
      readonly namespace: string;
      readonly tables: undefined extends input["tables"]
        ? {}
        : resolveTables<
            {
              readonly [label in keyof input["tables"]]: mergeIfUndefined<
                expandTableShorthand<input["tables"][label]>,
                { readonly namespace: string }
              >;
            },
            scope
          >;
    }
  : never;

export function resolveNamespace<const input extends NamespaceInput, scope extends Scope = AbiTypeScope>(
  input: input,
  scope: scope = AbiTypeScope as never,
): resolveNamespace<input, scope> {
  const label = input.label;
  const namespace = input.namespace ?? label.slice(0, 14);
  return {
    label,
    namespace,
    tables: resolveTables(
      flatMorph(input.tables ?? {}, (label, table) => {
        return [label, mergeIfUndefined(expandTableShorthand(table, scope), { namespace })];
      }),
      scope,
    ),
  } as never;
}
