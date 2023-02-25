import { findUp } from "find-up";
import path from "path";
import { ERRORS, MUDError } from "../utils/errors.js";

// Based on hardhat's config (MIT)
// https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core

// In order of preference files are checked
const configFiles = ["mud.config.ts", "mud.config.mts"];

export async function loadConfig(configPath?: string): Promise<unknown> {
  configPath = await resolveConfigPath(configPath);
  try {
    return (await import(configPath)).default;
  } catch (error) {
    if (error instanceof SyntaxError && error.message === "Cannot use import statement outside a module") {
      // TODO custom error can be used here to instruct to use .mts or type="module"
      throw error;
    } else {
      throw error;
    }
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
    throw new MUDError(ERRORS.NOT_INSIDE_PROJECT);
  }
  return tsConfigPath;
}
