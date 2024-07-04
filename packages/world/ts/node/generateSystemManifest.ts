import path from "node:path";
import fs from "node:fs/promises";
import { World } from "../config/v2";
import { getSystemContracts } from "./getSystemContracts";
import { getSystemManifest } from "./getSystemManifest";

export type GenerateSystemManifestOptions = {
  readonly configPath: string;
  readonly config: World;
};

export async function generateSystemManifest({ configPath, config }: GenerateSystemManifestOptions): Promise<string> {
  const systemContracts = await getSystemContracts({ configPath, config });
  const systemManifest = getSystemManifest({ config, systemContracts });

  // TODO: generate corresponding .json.d.ts?
  const outputPath = path.join(path.dirname(configPath), config.metadataDirectory, "systems.json");

  // TODO: transform system source paths to be relative to manifest output path?

  // TODO: move to debug?
  console.log(`Writing system manifest to ${outputPath}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(systemManifest, null, 2) + "\n");

  return outputPath;
}
