import { globSync } from "glob";
import { basename } from "path";

/**
 * Get a list of all contract paths/names within the provided src directory
 */
export function getExistingContracts(srcDir: string) {
  return globSync(`${srcDir}/**/*.sol`)
    .map((path) => ({
      path,
      basename: basename(path, ".sol"),
    }))
    .sort((a, b) => a.basename.localeCompare(b.basename));
}
