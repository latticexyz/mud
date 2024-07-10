import path from "node:path";
import fs from "node:fs/promises";
import { World } from "../config/v2";
import { getSystemContracts } from "./getSystemContracts";
import { getSystemManifest } from "./getSystemManifest";

// MUD metadata directory (for manifests), relative to MUD project root (i.e. directory where mud.config.ts is)
// This is hardcoded here for now, but we may lift this up into other places or make it configurable, but don't want to add that complexity yet.
export const metadataDirectory = ".mud";

export type GenerateSystemManifestOptions = {
  readonly rootDir: string;
  readonly config: World;
};

export async function generateSystemManifest({ rootDir, config }: GenerateSystemManifestOptions): Promise<string> {
  const systemContracts = await getSystemContracts({ rootDir, config });
  const systemManifest = getSystemManifest({ config, systemContracts });

  const outputPath = path.join(rootDir, metadataDirectory, "systems.json");

  // TODO: move to debug?
  console.log(`Writing system manifest to ${outputPath}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(systemManifest, null, 2) + "\n");

  return outputPath;
}
