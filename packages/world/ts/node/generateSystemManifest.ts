import path from "node:path";
import fs from "node:fs/promises";
import { World } from "../config/v2";
import { getSystemContracts } from "./getSystemContracts";

export type GenerateSystemManifestOptions = {
  configPath: string;
  config: World;
};

export async function generateSystemManifest({ configPath, config }: GenerateSystemManifestOptions): Promise<string> {
  const systems = await getSystemContracts({ configPath, config });

  // TODO: iterate through config systems and adjust output accordingly
  // TODO: throw if any systems in config are missing from filesystem
  // TODO: exclude systems specified by config

  // TODO: should this be a .ts file? or a .json file with corresponding .json.d.ts?
  const outputPath = path.join(path.dirname(configPath), config.metadataDirectory, "systems.json");

  // TODO: transform system file paths to be relative to manifest output path?

  // TODO: move to debug?
  console.log(`Writing system manifest to ${outputPath}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(systems, null, 2) + "\n");

  return outputPath;
}
