import { AbiType, StaticAbiType, Schema, Table as BaseTable } from "@latticexyz/config";

export type { AbiType, Schema };

export type UserTypes = {
  readonly [userTypeName: string]: AbiType;
};

export type Enums = {
  readonly [enumName: string]: readonly [string, ...string[]];
};

export type KeySchema = {
  readonly [keyName: string]: {
    /** the Solidity primitive ABI type */
    readonly type: StaticAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type Table = BaseTable & {
  /** @deprecated Use `schema` and `primaryKey` */
  readonly keySchema: KeySchema;
  /** @deprecated Use `schema` and `primaryKey` */
  readonly valueSchema: Schema;
};

export type Config = {
  readonly tables: {
    readonly [namespacedTableName: string]: Table;
  };
  readonly userTypes: UserTypes;
  readonly enums: Enums;
  readonly namespace: string;
};
