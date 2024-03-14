import { Dict } from "@arktype/util";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { Hex } from "viem";
import { UserTypes } from "./store";

export type ResolvedSchemaConfig = {
  readonly [key: string]: {
    /** the Solidity primitive ABI type */
    readonly type: SchemaAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type ResolvedKeySchemaConfig = {
  readonly [key: string]: {
    /** the Solidity primitive ABI type */
    readonly type: StaticAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type ResolvedTableConfig = {
  readonly tableId: Hex;
  readonly primaryKey: readonly string[];
  readonly schema: ResolvedSchemaConfig;
  readonly keySchema: ResolvedKeySchemaConfig;
  readonly valueSchema: ResolvedSchemaConfig;
};

export type ResolvedStoreConfig = {
  readonly tables: Dict<string, ResolvedTableConfig>;
  readonly userTypes: UserTypes;
  readonly enums: Dict<string, readonly [string, ...string[]]>;
  readonly namespace: string;
};
