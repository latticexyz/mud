import { Hex } from "viem";
import { referenceIdentifier } from "./types";

// https://eips.ethereum.org/EIPS/eip-170
export const contractSizeLimit = parseInt("6000", 16);

export type ReferenceIdentifier = typeof referenceIdentifier.infer;

export type PendingBytecode = readonly (Hex | ReferenceIdentifier)[];

export type ContractArtifact = {
  readonly sourcePath: string;
  readonly name: string;
  // TODO: rename `createCode` or `creationBytecode` to better differentiate from deployed bytecode?
  readonly bytecode: PendingBytecode;
};
