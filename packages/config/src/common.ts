import { Hex } from "viem";
import { DynamicAbiType, StaticAbiType } from "@latticexyz/schema-type/internal";
import { ResourceType } from "@latticexyz/common";
import { satisfy } from "@ark/util";

/**
 * Common output types of a MUD config. We use these types as inputs for libraries.
 */

// Although we could import `SchemaAbiType` from `@latticexyz/schema-type` here, we "redefine" this here
// so that our downstream type errors give back `AbiType` instead of the union of all possible ABI types.
//
// This is a bit of a TS compiler hack and we should figure out a better long-term approach.
export type AbiType = StaticAbiType | DynamicAbiType;
export type { StaticAbiType, DynamicAbiType };

export type Schema = {
  readonly [fieldName: string]: {
    /** the Solidity primitive ABI type */
    readonly type: AbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type KeySchema = {
  readonly [fieldName: string]: {
    /** the Solidity primitive ABI type */
    readonly type: StaticAbiType;
    /** the user defined type or Solidity primitive ABI type */
    readonly internalType: string;
  };
};

export type Table = {
  readonly label: string;
  readonly type: satisfy<ResourceType, "table" | "offchainTable">;
  readonly namespace: string;
  readonly namespaceLabel: string;
  readonly name: string;
  readonly tableId: Hex;
  readonly schema: Schema;
  readonly key: readonly string[];
};

export type Tables = {
  readonly [label: string]: Table;
};
