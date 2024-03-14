import { Config as StoreConfig, Table } from "@latticexyz/store/config/v2";

export type Config = StoreConfig & {
  readonly namespaces: {
    readonly [namespace: string]: {
      readonly tables: {
        readonly [tableName: string]: Table;
      };
    };
  };
};
