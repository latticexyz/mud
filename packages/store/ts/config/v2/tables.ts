import { ErrorMessage, evaluate } from "@arktype/util";
import { isObject, mergeIfUndefined } from "./generics";
import { TablesInput } from "./input";
import { Scope, AbiTypeScope } from "./scope";
import { validateTable, resolveTable } from "./table";

export type validateTables<tables, scope extends Scope = AbiTypeScope> = {
  [label in keyof tables]: tables[label] extends object
    ? validateTable<tables[label], scope, { inStoreContext: true }>
    : ErrorMessage<`Expected full table config.`>;
};

export function validateTables<scope extends Scope = AbiTypeScope>(
  input: unknown,
  scope: scope,
): asserts input is TablesInput {
  if (isObject(input)) {
    for (const table of Object.values(input)) {
      validateTable(table, scope, { inStoreContext: true });
    }
    return;
  }
  throw new Error(`Expected store config, received ${JSON.stringify(input)}`);
}

export type resolveTables<tables, scope extends Scope = AbiTypeScope> = evaluate<{
  readonly [label in keyof tables]: resolveTable<mergeIfUndefined<tables[label], { label: label }>, scope>;
}>;

export function resolveTables<tables extends TablesInput, scope extends Scope = AbiTypeScope>(
  tables: tables,
  scope: scope,
): resolveTables<tables, scope> {
  if (!isObject(tables)) {
    throw new Error(`Expected tables config, received ${JSON.stringify(tables)}`);
  }

  return Object.fromEntries(
    Object.entries(tables).map(([label, table]) => {
      return [label, resolveTable(mergeIfUndefined(table, { label }), scope)];
    }),
  ) as never;
}
