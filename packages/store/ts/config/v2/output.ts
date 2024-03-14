import { Dict } from "@arktype/util";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { UserTypes } from "./store";

export type Schema = {
  readonly [fieldName: string]: {
    /** the Solidity primitive ABI type */
    readonly type: SchemaAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type KeySchema = {
  readonly [keyName: string]: {
    /** the Solidity primitive ABI type */
    readonly type: StaticAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type Table = {
  readonly tableId: Hex;
  readonly primaryKey: readonly string[];
  readonly schema: Schema;
  /** @deprecated Use `schema` and `primaryKey` */
  readonly keySchema: KeySchema;
  /** @deprecated Use `schema` and `primaryKey` */
  readonly valueSchema: Schema;
};

export type Config = {
  readonly tables: Dict<string, Table>;
  readonly userTypes: UserTypes;
  readonly enums: Dict<string, readonly [string, ...string[]]>;
  readonly namespace: string;
};
