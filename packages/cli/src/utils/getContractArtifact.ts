import { Abi, Hex, isHex, size } from "viem";
import { LibraryPlaceholder } from "../deploy/common";
import { findPlaceholders } from "./findPlaceholders";
import { z } from "zod";
import { Abi as abiSchema } from "abitype/zod";

export type GetContractArtifactOptions = {
  /**
   * Import path to contract's forge/solc JSON artifact with the contract's compiled bytecode.
   *
   * This path is resolved using node's contract resolution, so this supports both relative file paths (`../path/to/MyModule.json`) as well as JS import paths
   * (`@latticexyz/world-contracts/out/CallWithSignatureModule.sol/CallWithSignatureModule.json`).
   */
  artifactPath: string;
};

export type GetContractArtifactResult = {
  bytecode: Hex;
  placeholders: readonly LibraryPlaceholder[];
  abi: Abi;
  deployedBytecodeSize: number;
};

const bytecodeSchema = z.object({
  object: z.string().refine(isHex),
  linkReferences: z.record(
    z.record(
      z.array(
        z.object({
          start: z.number(),
          length: z.number(),
        }),
      ),
    ),
  ),
});

const artifactSchema = z.object({
  bytecode: bytecodeSchema,
  deployedBytecode: bytecodeSchema,
  abi: abiSchema,
});

export async function getContractArtifact({
  artifactPath,
}: GetContractArtifactOptions): Promise<GetContractArtifactResult> {
  // TODO: improve errors or replace with arktype?
  const artifact = artifactSchema.parse(await import(artifactPath));
  const placeholders = findPlaceholders(artifact.bytecode.linkReferences);

  return {
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    placeholders,
    deployedBytecodeSize: size(artifact.deployedBytecode.object),
  };
}
