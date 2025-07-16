import { findUp } from "find-up";
import path from "path";
import { pathToFileURL } from "url";
import os from "os";
import fs from "fs/promises";
import { tsImport } from "tsx/esm/api";
import { require as tsRequire } from "tsx/cjs/api";

// In order of preference files are checked
/** @deprecated */
const configFiles = ["mud.config.js", "mud.config.mjs", "mud.config.ts", "mud.config.mts"];

/** @deprecated */
export async function loadConfig(configPath?: string): Promise<unknown> {
  configPath = await resolveConfigPath(configPath);
  // load nearest package.json to figure out if we need to import with ESM or CJS
  const packageJsonPath = await findUp("package.json", { cwd: path.dirname(configPath) });
  if (!packageJsonPath) throw new Error(`Could not find package.json for config at "${configPath}".`);
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  // use require if cjs
  if (!packageJson.type || packageJson.type === "commonjs") {
    // tsRequire has an internal cache, so we need to append data to reload the config
    // this helps with things like the mud dev runner that reevalutes the config on changes
    return tsRequire(`${configPath}?update=${Date.now()}`, import.meta.url).default;
  }
  // otherwise default to esm
  // this is not cached, so we don't need to append anything to the config path
  return (await tsImport(configPath, import.meta.url)).default;
}

/** @deprecated */
export async function resolveConfigPath(configPath?: string, toFileURL?: boolean) {
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
  return toFileURL && os.platform() === "win32" ? pathToFileURL(configPath).href : configPath;
}

/** @deprecated */
async function getUserConfigPath() {
  const tsConfigPath = await findUp(configFiles);
  if (tsConfigPath === undefined) {
    throw new Error("Did not find a `mud.config.ts` file. Are you inside a MUD project?");
  }
  return tsConfigPath;
}
