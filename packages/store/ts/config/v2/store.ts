import { TableInput, resolveTableConfig, validateTableConfig } from "./table";

export interface StoreConfigInput {
  tables: StoreTablesConfigInput;
}

export interface StoreTablesConfigInput {
  [key: string]: TableInput;
}

export type validateStoreTablesConfig<input> = {
  [key in keyof input]: validateTableConfig<input[key]>;
};

export type validateStoreConfig<input> = {
  [k in keyof input]: k extends "tables" ? validateStoreTablesConfig<input[k]> : input[k];
};

export type resolveStoreConfig<input> = input extends StoreConfigInput
  ? {
      tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key]> };
    }
  : never;

export function resolveStoreConfig<input>(input: validateStoreConfig<input>): resolveStoreConfig<input> {
  return {} as never;
}
