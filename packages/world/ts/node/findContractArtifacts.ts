import path from "node:path";
import { readFile } from "node:fs/promises";
import { glob } from "glob";
import { type } from "arktype";
import { indent, isDefined } from "@latticexyz/common/utils";
import { Hex, size, sliceHex } from "viem";
import { ContractArtifact, ReferenceIdentifier, contractSizeLimit } from "./common";
import { types } from "./types";

export type Input = {
  readonly forgeOutDir: string;
};

export type Output = readonly ContractArtifact[];

const parseArtifact = type("parse.json").to(types.Artifact);

export async function findContractArtifacts({ forgeOutDir }: Input): Promise<Output> {
  const files = (await glob("**/*.sol/*.json", { ignore: "**/*.abi.json", cwd: forgeOutDir })).sort();
  const artifactsJson = await Promise.all(
    files.map(async (filename) => ({
      filename,
      json: await readFile(path.join(forgeOutDir, filename), "utf8"),
    })),
  );

  return artifactsJson
    .map(({ filename, json }) => {
      const artifact = parseArtifact(json);
      if (artifact instanceof type.errors) {
        // TODO: replace with debug
        console.warn(`Skipping invalid artifact at \`${filename}\`:\n\n${indent(artifact.message)}\n`);
        return;
      }
      return artifact;
    })
    .filter(isDefined)
    .map((artifact) => {
      const sourcePath = Object.keys(artifact.metadata.settings.compilationTarget)[0];
      const name = artifact.metadata.settings.compilationTarget[sourcePath];
      const deployedBytecodeSize = size(artifact.deployedBytecode.object);

      if (deployedBytecodeSize > contractSizeLimit) {
        console.warn(
          // eslint-disable-next-line max-len
          `\nBytecode for \`${name}\` at \`${sourcePath}\` (${deployedBytecodeSize} bytes) is over the contract size limit (${contractSizeLimit} bytes). Run \`forge build --sizes\` for more info.\n`,
        );
      } else if (deployedBytecodeSize > contractSizeLimit * 0.95) {
        console.warn(
          // eslint-disable-next-line max-len
          `\nBytecode for \`${name}\` at \`${sourcePath}\` (${deployedBytecodeSize} bytes) is almost over the contract size limit (${contractSizeLimit} bytes). Run \`forge build --sizes\` for more info.\n`,
        );
      }

      const bytecode = artifact.bytecode.object;
      const placeholders = Object.entries(artifact.bytecode.linkReferences ?? {}).flatMap(([sourcePath, names]) =>
        Object.entries(names).flatMap(([name, slices]) => slices.map((slice) => ({ sourcePath, name, ...slice }))),
      );

      const pendingBytecode: (Hex | ReferenceIdentifier)[] = [];
      let offset = 0;
      for (const { sourcePath, name, start, length } of placeholders) {
        pendingBytecode.push(sliceHex(bytecode, offset, start));
        pendingBytecode.push({ sourcePath, name });
        offset = start + length;
      }
      pendingBytecode.push(sliceHex(bytecode, offset));

      return { sourcePath, name, bytecode: pendingBytecode, abi: artifact.abi };
    });
}