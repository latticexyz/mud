import { ErrorMessage, show } from "@ark/util";
import { isObject, mergeIfUndefined } from "./generics";
import { TableShorthandInput, TablesInput } from "./input";
import { Scope, AbiTypeScope } from "./scope";
import { validateTable, resolveTable } from "./table";
import { expandTableShorthand, isTableShorthandInput, validateTableShorthand } from "./tableShorthand";

export type validateTables<tables, scope extends Scope = AbiTypeScope> = {
  [label in keyof tables]: tables[label] extends TableShorthandInput
    ? validateTableShorthand<tables[label], scope>
    : tables[label] extends object
      ? validateTable<tables[label], scope, { inStoreContext: true }>
      : ErrorMessage<`Expected tables config.`>;
};

export function validateTables<scope extends Scope = AbiTypeScope>(
  input: unknown,
  scope: scope,
): asserts input is TablesInput {
  if (isObject(input)) {
    for (const table of Object.values(input)) {
      if (isTableShorthandInput(table)) {
        validateTableShorthand(table, scope);
      } else {
        validateTable(table, scope, { inStoreContext: true });
      }
    }
    return;
  }
  throw new Error(`Expected tables config, received ${JSON.stringify(input)}`);
}

export type resolveTables<tables, scope extends Scope = AbiTypeScope> = {
  readonly [label in keyof tables]: resolveTable<
    mergeIfUndefined<expandTableShorthand<tables[label]>, { readonly label: label }>,
    scope
  >;
};

export function resolveTables<tables extends TablesInput, scope extends Scope = AbiTypeScope>(
  tables: tables,
  scope: scope,
): resolveTables<tables, scope> {
  return Object.fromEntries(
    Object.entries(tables).map(([label, table]) => {
      return [label, resolveTable(mergeIfUndefined(expandTableShorthand(table, scope), { label }), scope)];
    }),
  ) as never;
}

export function defineTables<input, scope extends Scope = AbiTypeScope>(
  input: validateTables<input, scope>,
  scope: scope = AbiTypeScope as never,
): show<resolveTables<input, scope>> {
  validateTables(input, scope);
  return resolveTables(input, scope) as never;
}
