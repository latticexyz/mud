import { readFile } from "node:fs/promises";
import { glob } from "glob";
import { parseArtifact } from "./types";
import { ContractArtifact } from "./common";
import { getPlaceholders } from "./getPlaceholders";
import { size } from "viem";
import path from "node:path";
import { type } from "arktype";

export type Input = {
  readonly forgeOutDir: string;
};

export type Output = readonly ContractArtifact[];

// TODO: figure out what `sourcePath` is for imported public libs (actual import path? resolved path from remappings?)

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
        throw new Error(`Could not parse artifact at \`${filename}\`\n\n${artifact.message}`);
      }
      return artifact;
    })
    .filter((artifact) => artifact.metadata)
    .map((artifact) => {
      const sourcePath = Object.keys(artifact.metadata!.settings.compilationTarget)[0];
      const name = artifact.metadata!.settings.compilationTarget[sourcePath];
      const bytecode = artifact.bytecode.object;
      const placeholders = getPlaceholders(artifact.bytecode.linkReferences ?? {});
      const deployedBytecodeSize = size(artifact.deployedBytecode.object);
      return { sourcePath, name, bytecode, placeholders, deployedBytecodeSize };
    });
}
