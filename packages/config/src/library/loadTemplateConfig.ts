import { findUp } from "find-up";
import path from "path";
import { NotInsideProjectError } from "./errors";
import esbuild from "esbuild";
import { rmSync } from "fs";

// In order of preference files are checked
const configFiles = ["template.config.js", "template.config.mjs", "template.config.ts", "template.config.mts"];
const TEMP_CONFIG = "template.config.temp.mjs";

export async function loadTemplateConfig(configPath?: string): Promise<unknown> {
  configPath = await resolveConfigPath(configPath);
  try {
    await esbuild.build({ entryPoints: [configPath], format: "esm", outfile: TEMP_CONFIG });
    configPath = await resolveConfigPath(TEMP_CONFIG);
    return (await import(configPath)).default;
  } finally {
    rmSync(TEMP_CONFIG);
  }
}

async function resolveConfigPath(configPath: string | undefined) {
  if (configPath === undefined) {
    configPath = await getUserConfigPath();
  } else {
    if (!path.isAbsolute(configPath)) {
      configPath = path.join(process.cwd(), configPath);
      configPath = path.normalize(configPath);
    }
  }
  return configPath;
}

async function getUserConfigPath() {
  const tsConfigPath = await findUp(configFiles);
  if (tsConfigPath === undefined) {
    throw new NotInsideProjectError();
  }
  return tsConfigPath;
}
