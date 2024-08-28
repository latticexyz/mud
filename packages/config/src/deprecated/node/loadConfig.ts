import { findUp } from "find-up";
import path from "node:path/posix";
import esbuild from "esbuild";
import { rmSync } from "fs";
import { pathToFileURL } from "url";
import os from "os";

// TODO: explore using https://www.npmjs.com/package/ts-import instead

// In order of preference files are checked
/** @deprecated */
const configFiles = ["mud.config.js", "mud.config.mjs", "mud.config.ts", "mud.config.mts"];
/** @deprecated */
const TEMP_CONFIG = "mud.config.temp.mjs";

/** @deprecated */
export async function loadConfig(configPath?: string): Promise<unknown> {
  configPath = await resolveConfigPath(configPath);
  try {
    await esbuild.build({
      entryPoints: [configPath],
      format: "esm",
      outfile: TEMP_CONFIG,
      // https://esbuild.github.io/getting-started/#bundling-for-node
      platform: "node",
      // bundle local imports (otherwise it may error, js can't import ts)
      bundle: true,
      // avoid bundling external imports (it's unnecessary and esbuild can't handle all node features)
      packages: "external",
    });
    configPath = await resolveConfigPath(TEMP_CONFIG, true);
    // Node.js caches dynamic imports, so without appending a cache breaking
    // param like `?update={Date.now()}` this import always returns the same config
    // if called multiple times in a single process, like the `dev-contracts` cli
    return (await import(configPath + `?update=${Date.now()}`)).default;
  } finally {
    rmSync(TEMP_CONFIG, { force: true });
  }
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
