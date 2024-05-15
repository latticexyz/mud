import { Abi, Hex, isHex, size } from "viem";
import { LibraryPlaceholder } from "../deploy/common";
import { findPlaceholders } from "./findPlaceholders";
import { z } from "zod";
import { Abi as abiSchema } from "abitype/zod";
import { createRequire } from "node:module";
import { findUp } from "find-up";

export type GetContractArtifactOptions = {
  /**
   * Path to `package.json` where `artifactPath`s are resolved relative to.
   *
   * Defaults to nearest `package.json` relative to `process.cwd()`.
   */
  packageJsonPath?: string;
  /**
   * Import path to contract's forge/solc JSON artifact with the contract's compiled bytecode.
   *
   * This path is resolved using node's module resolution relative to `configPath`, so this supports both
   * relative file paths (`../path/to/MyModule.json`) as well as JS import paths (`@latticexyz/world-contracts/out/CallWithSignatureModule.sol/CallWithSignatureModule.json`).
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
  packageJsonPath,
  artifactPath,
}: GetContractArtifactOptions): Promise<GetContractArtifactResult> {
  let importedArtifact;
  try {
    const requirePath = packageJsonPath ?? (await findUp("package.json", { cwd: process.cwd() }));
    if (!requirePath) throw new Error("Could not find package.json to import relative to.");

    const require = createRequire(requirePath);
    importedArtifact = require(artifactPath);
  } catch (error) {
    console.error();
    console.error("Could not import contract artifact at", artifactPath);
    console.error();
    throw error;
  }

  // TODO: improve errors or replace with arktype?
  const artifact = artifactSchema.parse(importedArtifact);
  const placeholders = findPlaceholders(artifact.bytecode.linkReferences);

  return {
    abi: artifact.abi,
    bytecode: artifact.bytecode.object,
    placeholders,
    deployedBytecodeSize: size(artifact.deployedBytecode.object),
  };
}
