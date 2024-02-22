import { TableConfigInput, resolveTableConfig } from "./resolveTableConfig";

export interface StoreConfigInput {
  tables: StoreTablesConfigInput;
}

export interface StoreTablesConfigInput {
  [key: string]: TableConfigInput;
}

export type resolveStoreConfig<storeConfigInput extends StoreConfigInput> = {
  tables: { [key in keyof storeConfigInput["tables"]]: resolveTableConfig<storeConfigInput["tables"][key]> };
};

export const resolveStoreConfig = <storeConfigInput extends StoreConfigInput>(
  storeConfigInput: storeConfigInput
): resolveStoreConfig<storeConfigInput> => {
  return {} as resolveStoreConfig<storeConfigInput>;
};
