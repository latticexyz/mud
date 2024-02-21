export interface StoreConfigInput {
  tables: StoreTablesConfigInput;
}

export interface StoreTablesConfigInput {
  [key: string]: StoreTableConfigInput;
}

export interface StoreTableConfigInput {
  name: string;
}

export interface StoreConfigOutput<configInput extends StoreConfigInput> {
  resolved: StoreResolvedConfigOutput<configInput>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type StoreResolvedConfigOutput<configInput extends StoreConfigInput> = {
  tables: {
    [key in keyof configInput["tables"]]: `resolved-${configInput["tables"][key]["name"]}`;
  };
};

export type withStoreConfig<configInput extends StoreConfigInput> = configInput & StoreConfigOutput<configInput>;

export const withStoreConfig = <configInput extends StoreConfigInput>(
  configInput: configInput
): withStoreConfig<configInput> => {
  return {} as withStoreConfig<configInput>;
};

const a = withStoreConfig({ tables: { input: { name: "test" } } } as const);

a.resolved.input;
//         ^?
