import { Hex } from "viem";

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

export type PendingContract = {
  readonly bytecode: Hex;
  readonly placeholders: readonly LibraryPlaceholder[];
  // TODO: ABI
};

export type PendingLibrary = LibraryIdentifier & PendingContract;

export type PendingSystem = PendingContract & {
  readonly systemId: Hex;
  // TODO: system function signtures
  // TODO: world function signatures
  // TODO: access control
};

export type PendingBytecode = readonly (Hex | PendingBytecode)[];

export type SystemDeploy = {
  readonly systemId: Hex;
  readonly bytecode: Hex;
  readonly placeholders: readonly LibraryPlaceholder[];
};

export type LibraryDeploy = LibraryIdentifier & {
  readonly bytecode: Hex;
  readonly placeholders: readonly LibraryPlaceholder[];
};

// TODO: clean up
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
