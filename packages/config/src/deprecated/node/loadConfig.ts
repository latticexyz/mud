import { findUp } from "find-up";
import path from "node:path/posix";
import esbuild from "esbuild";
import { rmSync } from "fs";
import { pathToFileURL } from "url";
import os from "os";
import upath from "upath";

// TODO: explore using https://www.npmjs.com/package/ts-import instead

// In order of preference files are checked
/** @deprecated */
const configFiles = ["mud.config.js", "mud.config.mjs", "mud.config.ts", "mud.config.mts"];
/** @deprecated */
const TEMP_CONFIG = "mud.config.temp.mjs";

function prepareWindowsPath(fullPath: string): string {
  if (os.platform() === "win32") {
    // Add `file:///` for Windows support
    // (see https://github.com/nodejs/node/issues/31710)
    return pathToFileURL(
      // undo prefix we added in `resolveConfigPath`
      fullPath.replace(/^\/(\w+:\/)/, "$1"),
    ).href;
  }
  return fullPath;
}

/** @deprecated */
export async function loadConfig(configPath?: string): Promise<unknown> {
  const inputPath = await resolveConfigPath(configPath);
  const outputPath = path.join(path.dirname(inputPath), TEMP_CONFIG);
  console.log("inputPath", inputPath);
  console.log("outputPath", outputPath);
  console.log("absWorkingDir", prepareWindowsPath(path.dirname(inputPath)));
  console.log("entryPoint", path.basename(inputPath));
  console.log("outfile", path.basename(outputPath));
  console.log("import+rm", prepareWindowsPath(outputPath));
  try {
    await esbuild.build({
      absWorkingDir: prepareWindowsPath(path.dirname(inputPath)).replace(/^file:\/\/\//, ""),
      entryPoints: [path.basename(inputPath)],
      format: "esm",
      outfile: path.basename(outputPath),
      // https://esbuild.github.io/getting-started/#bundling-for-node
      platform: "node",
      // bundle local imports (otherwise it may error, js can't import ts)
      bundle: true,
      // avoid bundling external imports (it's unnecessary and esbuild can't handle all node features)
      packages: "external",
    });
    // Node.js caches dynamic imports, so without appending a cache breaking
    // param like `?update={Date.now()}` this import always returns the same config
    // if called multiple times in a single process, like the `dev-contracts` cli
    return (await import(`${prepareWindowsPath(outputPath)}?update=${Date.now()}`)).default;
  } finally {
    rmSync(prepareWindowsPath(outputPath), { force: true });
  }
}

/** @deprecated */
export async function resolveConfigPath(configPath?: string) {
  if (configPath === undefined) {
    configPath = await getUserConfigPath();
  } else {
    if (!path.isAbsolute(configPath)) {
      configPath = path.join(process.cwd(), configPath);
      configPath = path.normalize(configPath);
    }
  }
  return (
    upath
      .normalize(configPath)
      // discard drive letter to make it easier to work with
      // this means working with files across drives in windows won't work
      .replace(/^\w+:\//, "/")
  );
}

/** @deprecated */
async function getUserConfigPath() {
  const tsConfigPath = await findUp(configFiles);
  if (tsConfigPath === undefined) {
    throw new Error("Did not find a `mud.config.ts` file. Are you inside a MUD project?");
  }
  return tsConfigPath;
}
