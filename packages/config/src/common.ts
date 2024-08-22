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

export type Table = {
  /**
   * Human-readable label for this table's namespace. Used for namespace config keys and directory names.
   */
  readonly namespaceLabel: string;
  /**
   * Human-readable label for this table. Used as config keys, library names, and filenames.
   * Labels are not length constrained like resource names, but special characters should be avoided to be compatible with the filesystem, Solidity compiler, etc.
   */
  readonly label: string;
  /**
   * Table type used in table's resource ID and determines how storage and events are used by this table.
   */
  readonly type: satisfy<ResourceType, "table" | "offchainTable">;
  /**
   * Table namespace used in table's resource ID and determines access control.
   */
  readonly namespace: string;
  /**
   * Table name used in system's resource ID.
   */
  readonly name: string;
  /**
   * Table's resource ID.
   */
  readonly tableId: Hex;
  /**
   * Schema definition for this table's records.
   */
  readonly schema: Schema;
  /**
   * Primary key for records of this table. An array of zero or more schema field names.
   * Using an empty array acts like a singleton, where only one record can exist for this table.
   */
  readonly key: readonly string[];
};

export type Tables = {
  readonly [label: string]: Table;
};
