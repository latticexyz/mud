import { Abi, Hex, isHex, size } from "viem";
import { LibraryPlaceholder } from "../deploy/common";
import { findPlaceholders } from "./findPlaceholders";
import { z } from "zod";
import { Abi as abiSchema } from "abitype/zod";

export type GetContractArtifactResult = {
  bytecode: Hex;
  placeholders: readonly LibraryPlaceholder[];
  abi: Abi;
  deployedBytecodeSize: number;
};

function isBytecode(value: string): value is Hex {
  return isHex(value, { strict: false });
}

const bytecodeSchema = z.object({
  object: z.string().refine(isBytecode),
  linkReferences: z
    .record(
      z.record(
        z.array(
          z.object({
            start: z.number(),
            length: z.number(),
          }),
        ),
      ),
    )
    .optional(),
});

const artifactSchema = z.object({
  bytecode: bytecodeSchema,
  deployedBytecode: bytecodeSchema,
  abi: abiSchema,
});

export function getContractArtifact(artifactJson: unknown): GetContractArtifactResult {
  // TODO: improve errors or replace with arktype?
  const artifact = artifactSchema.parse(artifactJson);
  const placeholders = findPlaceholders(artifact.bytecode.linkReferences ?? {});

  return {
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    placeholders,
    deployedBytecodeSize: size(artifact.deployedBytecode.object),
  };
}
