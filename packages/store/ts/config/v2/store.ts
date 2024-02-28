import { conform } from "./generics";
import { TableConfigInput, inferSchema, resolveTableConfig, validateTableConfig } from "./table";

export interface StoreConfigInput {
  tables: StoreTablesConfigInput;
}

export interface StoreTablesConfigInput {
  [key: string]: TableConfigInput;
}

export type validateStoreTablesConfig<input extends StoreTablesConfigInput> = conform<
  input,
  { [key in keyof input]: validateTableConfig<input[key], inferSchema<input[key]>> }
>;

export type validateStoreConfig<input extends StoreConfigInput> = conform<
  input,
  { tables: validateStoreTablesConfig<input["tables"]> }
>;

export type resolveStoreConfig<input extends StoreConfigInput> = {
  tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key]> };
};

export function resolveStoreConfig<input extends StoreConfigInput>(
  input: validateStoreConfig<input>
): resolveStoreConfig<input> {
  return {} as never;
}
