import { narrow } from "./generics";
import { Schema } from "./schema";
import { TableConfigInput, ValidKeys, inferSchema, resolveTableConfig, validateTableConfig } from "./table";

export interface StoreConfigInput<
  schema extends Schema = Schema,
  keys extends ValidKeys<schema> = ValidKeys<schema>,
  table extends TableConfigInput<schema, keys> = TableConfigInput<schema, keys>
> {
  tables: StoreTablesConfigInput<schema, keys, table>;
}

export interface StoreTablesConfigInput<
  schema extends Schema,
  keys extends ValidKeys<schema>,
  table extends TableConfigInput<schema, keys> = TableConfigInput<schema, keys>
> {
  [key: string]: table;
}

export type validateStoreConfig<input extends StoreConfigInput> = {
  tables: {
    [key in keyof input["tables"]]: validateTableConfig<input["tables"][key], inferSchema<input["tables"][key]>>;
  };
};

export type resolveStoreConfig<input extends StoreConfigInput> = {
  tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key]> };
};

export function resolveStoreConfig<input extends StoreConfigInput>(
  input: narrow<input, StoreConfigInput<inferSchema<input["tables"][string]>>> & validateStoreConfig<input>
): resolveStoreConfig<input> {
  return {} as never;
}
