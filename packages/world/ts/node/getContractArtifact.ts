import { readFile } from "node:fs/promises";
import path from "node:path";
import { artifact, parseArtifact } from "./types";
import { type } from "arktype";

export type Input = {
  forgeOutDirectory: string;
  filename: string;
  contractName: string;
};

export type Output = typeof artifact.infer;

export async function getContractArtifact({ forgeOutDirectory, filename, contractName }: Input): Promise<Output> {
  const artifactPath = path.join(forgeOutDirectory, filename, contractName + ".json");
  const artifactJson = await readFile(artifactPath, "utf-8");

  const parsedArtifact = parseArtifact(artifactJson);
  if (parsedArtifact instanceof type.errors) {
    return parsedArtifact.throw();
  }

  return parsedArtifact;
}
