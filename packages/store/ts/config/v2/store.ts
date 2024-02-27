import { conform } from "./generics";
import { TableConfigInput, resolveTableConfig, validateTableConfig } from "./table";

export interface StoreConfigInput {
  tables: StoreTablesConfigInput;
}

export interface StoreTablesConfigInput {
  [key: string]: TableConfigInput;
}

type validateStoreConfig<input extends StoreConfigInput> = {
  tables: {
    [key in keyof input["tables"]]: validateTableConfig<input["tables"][key]>;
  };
};

export type resolveStoreConfig<input extends StoreConfigInput> = {
  tables: { [key in keyof input["tables"]]: resolveTableConfig<input["tables"][key]> };
};

export function resolveStoreConfig<input extends StoreConfigInput>(
  input: conform<input, StoreConfigInput> & validateStoreConfig<input>
): resolveStoreConfig<input> {
  return {} as never;
}
