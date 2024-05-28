import glob from "glob";
import { basename } from "path";

/**
 * Get a list of all contract paths/names within the provided src directory
 */
export function getExistingDatas(outDir: string) {
  return glob.sync(`${outDir}/**/*.json`).map((path) => ({
    path,
    basename: basename(path, ".json"),
  }));
}
