import { readFile } from "node:fs/promises";
import { glob } from "glob";
import { parseArtifact } from "./types";
import path from "node:path";
import { type } from "arktype";
import { isDefined } from "@latticexyz/common/utils";
import { getPlaceholders } from "./getPlaceholders";
import { size } from "viem";
import { ContractArtifact } from "./common";

export type Input = {
  readonly forgeOutDir: string;
};

export type Output = readonly ContractArtifact[];

function indent(message: string, indentation = "  "): string {
  return message.replaceAll(/(^|\n)/g, `$1${indentation}`);
}

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
      const bytecode = artifact.bytecode.object;
      const placeholders = getPlaceholders(artifact.bytecode.linkReferences ?? {});
      const deployedBytecodeSize = size(artifact.deployedBytecode.object);
      return { sourcePath, name, bytecode, placeholders, deployedBytecodeSize };
    });
}
