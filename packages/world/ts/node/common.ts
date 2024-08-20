import { Abi, Hex } from "viem";

// https://eips.ethereum.org/EIPS/eip-170
export const contractSizeLimit = parseInt("6000", 16);

export type ReferenceIdentifier = {
  /**
   * Path to source file, e.g. `src/SomeLib.sol`
   */
  sourcePath: string;
  /**
   * Reference name, e.g. `SomeLib`
   */
  name: string;
};

export type PendingBytecode = readonly (Hex | ReferenceIdentifier)[];

export type ContractArtifact = {
  readonly sourcePath: string;
  readonly name: string;
  // TODO: rename `createCode` or `creationBytecode` to better differentiate from deployed bytecode?
  readonly bytecode: PendingBytecode;
  readonly abi: Abi;
};
