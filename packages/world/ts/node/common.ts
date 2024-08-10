import { Hex } from "viem";

// https://eips.ethereum.org/EIPS/eip-170
export const contractSizeLimit = parseInt("6000", 16);

export type LibraryIdentifier = {
  /**
   * Path to library source file, e.g. `src/libraries/SomeLib.sol`
   */
  readonly sourcePath: string;
  /**
   * Library name, e.g. `SomeLib`
   */
  readonly name: string;
};

export type LibraryPlaceholder = LibraryIdentifier & {
  /**
   * Byte offset of placeholder in bytecode
   */
  readonly start: number;
  /**
   * Size of placeholder to replace in bytes
   */
  readonly length: number;
};

export type DeployableReference = { readonly deployable: string };
export type PendingBytecode = readonly (Hex | DeployableReference)[];

export type ContractArtifact = {
  readonly sourcePath: string;
  readonly name: string;
  // TODO: rename `createCode` or `creationBytecode` to better differentiate from deployed bytecode?
  readonly bytecode: Hex;
  readonly placeholders: readonly LibraryPlaceholder[];
  /**
   * Size of deployed bytecode so that our tooling can warn when a contract is getting close to the EVM size limit.
   */
  readonly deployedBytecodeSize: number;
};
