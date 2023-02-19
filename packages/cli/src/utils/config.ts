// TODO unfinished placeholder
export interface StoreUserConfig {
  storePath?: string;
  tables: {
    [name: string]: {
      keys?: string[];
      schema: {
        [valueName: string]: number;
      };
    };
  };
}

export interface StoreConfig extends StoreUserConfig {
  storePath: string;
  tables: {
    [name: string]: {
      keys: string[];
      schema: {
        [valueName: string]: number;
      };
    };
  };
}
