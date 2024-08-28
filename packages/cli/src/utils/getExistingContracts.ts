import { globSync } from "glob";
import { basename } from "node:path/posix";

/**
 * Get a list of all contract paths/names within the provided src directory
 */
export function getExistingContracts(srcDir: string) {
  return globSync(`${srcDir}/**/*.sol`, { posix: true })
    .sort()
    .map((path) => ({
      path,
      basename: basename(path, ".sol"),
    }));
}
