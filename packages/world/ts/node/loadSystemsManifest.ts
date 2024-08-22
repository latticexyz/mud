import fs from "node:fs/promises";
import path from "node:path";
import { type } from "arktype";
import { World } from "../config/v2";
import { systemsManifestFilename } from "./common";
import { SystemsManifest } from "./buildSystemsManifest";
import { indent } from "@latticexyz/common/utils";

const parseManifest = type("parse.json").to(SystemsManifest);

export async function loadSystemsManifest(opts: {
  rootDir: string;
  // config is optional in case we want to load manifest within a dependency, like store/world packages
  config?: World;
}): Promise<typeof SystemsManifest.infer> {
  const outFile = path.join(opts.rootDir, systemsManifestFilename);
  try {
    await fs.access(outFile, fs.constants.F_OK | fs.constants.R_OK);
  } catch (error) {
    throw new Error(
      `Systems manifest at "${systemsManifestFilename}" not found or not readable. Run \`mud build\` before trying again.`,
    );
  }

  const json = await fs.readFile(outFile, "utf8");
  const manifest = parseManifest(json);
  if (manifest instanceof type.errors) {
    throw new Error(
      `Invalid systems manifest at "${systemsManifestFilename}". Run \`mud build\` before trying again.\n${indent(manifest.message)}`,
    );
  }

  // TODO: validate that the manifest and config agree (if provided)

  return manifest;
}
