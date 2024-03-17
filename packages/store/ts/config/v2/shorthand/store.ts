import { mapObject } from "@latticexyz/common/utils";
import { AbiTypeScope } from "../scope";
import {
  resolveStoreConfig,
  validateStoreConfig,
  extendedScope,
  StoreConfigInput,
  scopeWithEnums,
  scopeWithUserTypes,
} from "../store";
import { TableInput, validateTable } from "../table";
import { TableShorthandInput, isTableShorthandInput, resolveTableShorthand, validateTableShorthand } from "./table";
import { Enums, UserTypes } from "../output";
import { SchemaInput } from "../schema";
import { get, hasOwnKey, isObject, mergeIfUndefined } from "../generics";

export type StoreConfigInputWithShorthands<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = Omit<
  StoreConfigInput<userTypes, enums>,
  "tables"
> & { tables: StoreTablesConfigWithShorthandsInput<scopeWithEnums<enums, scopeWithUserTypes<userTypes>>> };

export type StoreTablesConfigWithShorthandsInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: TableInput<SchemaInput<scope>, scope> | TableShorthandInput<scope>;
};

export type validateTableShorthandOrFull<input, scope extends AbiTypeScope = AbiTypeScope> =
  input extends TableShorthandInput<scope>
    ? validateTableShorthand<input, scope>
    : input extends string
      ? validateTableShorthand<input, scope>
      : validateTable<input, scope>;

export type validateStoreWithShorthands<input> = {
  [key in keyof input]: key extends "tables"
    ? {
        [tableKey in keyof input[key]]: validateTableShorthandOrFull<input[key][tableKey], extendedScope<input>>;
      }
    : validateStoreConfig<input>[key];
};

export function validateStoreWithShorthands(input: unknown): asserts input is StoreConfigInputWithShorthands {
  const scope = extendedScope(input);
  if (hasOwnKey(input, "tables") && isObject(input.tables)) {
    for (const key of Object.keys(input.tables)) {
      if (isTableShorthandInput(get(input.tables, key), scope)) {
        validateTableShorthand(get(input.tables, key), scope);
      } else {
        validateTable(get(input.tables, key), scope);
      }
    }
  }
}

type resolveIfShorthand<input, scope extends AbiTypeScope = AbiTypeScope> =
  input extends TableShorthandInput<scope> ? resolveTableShorthand<input, scope> : input;

export type resolveStoreWithShorthands<input> = resolveStoreConfig<{
  [key in keyof input]: key extends "tables"
    ? {
        [tableKey in keyof input[key]]: mergeIfUndefined<
          resolveIfShorthand<input[key][tableKey], extendedScope<input>>,
          { name: tableKey }
        >;
      }
    : input[key];
}>;

export function resolveStoreWithShorthands<const input>(
  input: validateStoreWithShorthands<input>,
): resolveStoreWithShorthands<input> {
  validateStoreWithShorthands(input);

  const scope = extendedScope(input);
  const fullConfig = {
    ...input,
    tables: mapObject(input.tables, (table) => {
      return isTableShorthandInput(table, scope)
        ? resolveTableShorthand(table as validateTableShorthand<typeof table, typeof scope>, scope)
        : table;
    }),
  };

  return resolveStoreConfig(
    fullConfig as validateStoreConfig<typeof fullConfig>,
  ) as unknown as resolveStoreWithShorthands<input>;
}
