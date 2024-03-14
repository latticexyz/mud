import { Config as StoreConfig, Table } from "@latticexyz/store/config/v2";

export type Config = StoreConfig & {
  readonly namespaces: {
    readonly [key: string]: {
      readonly tables: {
        readonly [key: string]: Table;
      };
    };
  };
};
