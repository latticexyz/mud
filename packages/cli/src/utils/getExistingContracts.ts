import glob from "glob";
import { basename } from "path";

/**
 * Get a list of all contract paths/names within the provided src directory
 */
export function getExistingContracts(srcDir: string) {
  return glob.sync(`${srcDir}/**/*.sol`).map((path) => ({
    path,
    basename: basename(path, ".sol"),
  }));
}
