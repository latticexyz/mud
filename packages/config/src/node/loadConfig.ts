import { findUp } from "find-up";
import path from "path";
import { NotInsideProjectError } from "../library/errors";
import esbuild from "esbuild";
import { rmSync } from "fs";
import { pathToFileURL } from "url";
import os from "os";

// In order of preference files are checked
const configFiles = ["mud.config.js", "mud.config.mjs", "mud.config.ts", "mud.config.mts"];
const TEMP_CONFIG = "mud.config.temp.mjs";

export async function loadConfig(configPath?: string): Promise<unknown> {
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

  // Add `file:///` for Windows support
  // (see https://github.com/nodejs/node/issues/31710)
  return os.platform() === "win32" ? pathToFileURL(configPath).href : configPath;
}

async function getUserConfigPath() {
  const tsConfigPath = await findUp(configFiles);
  if (tsConfigPath === undefined) {
    throw new NotInsideProjectError();
  }
  return tsConfigPath;
}
