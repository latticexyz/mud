import { SchemaInput } from "./schema";
import { AbiTypeScope } from "./scope";
import { TableInput, resolveTableConfig, validateTableConfig } from "./table";

export interface StoreConfigInput<scope extends AbiTypeScope = AbiTypeScope> {
  tables: StoreTablesConfigInput<scope>;
}

export interface StoreTablesConfigInput<scope extends AbiTypeScope = AbiTypeScope> {
  [key: string]: TableInput<SchemaInput<scope>, scope>;
}

export type validateStoreTablesConfig<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: validateTableConfig<input[key], scope>;
};

export type validateStoreConfig<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [k in keyof input]: k extends "tables" ? validateStoreTablesConfig<input[k], scope> : input[k];
};

export type resolveStoreConfig<input, scope extends AbiTypeScope = AbiTypeScope> = input extends StoreConfigInput<scope>
  ? {
      tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key], scope> };
    }
  : never;

export function resolveStoreConfig<input, scope extends AbiTypeScope = AbiTypeScope>(
  input: validateStoreConfig<input, scope>,
  scope?: scope
): resolveStoreConfig<input, scope> {
  return {} as never;
}
