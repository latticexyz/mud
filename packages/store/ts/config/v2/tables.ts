import { ErrorMessage, evaluate } from "@arktype/util";
import { isObject, mergeIfUndefined } from "./generics";
import { TablesInput } from "./input";
import { Scope, AbiTypeScope } from "./scope";
import { validateTable, resolveTable } from "./table";

export type validateTables<tables, scope extends Scope = AbiTypeScope> = {
  [key in keyof tables]: tables[key] extends object
    ? validateTable<tables[key], scope, { inStoreContext: true }>
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
  readonly [key in keyof tables]: resolveTable<mergeIfUndefined<tables[key], { name: key }>, scope>;
}>;

export function resolveTables<tables extends TablesInput, scope extends Scope = AbiTypeScope>(
  tables: tables,
  scope: scope = AbiTypeScope as unknown as scope,
): resolveTables<tables, scope> {
  if (!isObject(tables)) {
    throw new Error(`Expected tables config, received ${JSON.stringify(tables)}`);
  }

  return Object.fromEntries(
    Object.entries(tables).map(([key, table]) => {
      return [key, resolveTable(mergeIfUndefined(table, { name: key }), scope)];
    }),
  ) as never;
}
