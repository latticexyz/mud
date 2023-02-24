import { findUpSync } from "find-up";
import path from "path";
import { ERRORS, MUDError } from "../utils/errors.js";

// TODO require may or may not be needed, finish exploring the various configurations
import { createRequire } from "module";
import { fileURLToPath } from "url";
const require = createRequire(fileURLToPath(import.meta.url));

// Based on hardhat's config (MIT)
// https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core

const TS_CONFIG_FILENAME = "mud.config.mts";

export async function loadConfig(configPath?: string): Promise<unknown> {
  configPath = resolveConfigPath(configPath);

  const config = (await import(configPath)).default;
  console.log("Config loaded:", config);
  return config;
}

function resolveConfigPath(configPath: string | undefined) {
  if (configPath === undefined) {
    configPath = getUserConfigPath();
  } else {
    if (!path.isAbsolute(configPath)) {
      configPath = path.join(process.cwd(), configPath);
      configPath = path.normalize(configPath);
    }
  }
  return configPath;
}

function getUserConfigPath() {
  const tsConfigPath = findUpSync(TS_CONFIG_FILENAME);
  if (tsConfigPath === undefined) {
    throw new MUDError(ERRORS.NOT_INSIDE_PROJECT);
  }
  return tsConfigPath;
}
