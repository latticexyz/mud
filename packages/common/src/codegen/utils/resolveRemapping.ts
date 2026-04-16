import path from "path";

/**
 * Resolves an import path using forge remappings
 * @param importPath The import path to resolve (e.g., "@latticexyz/store/src/Store.sol")
 * @param remappings Array of forge remapping strings (e.g., ["@latticexyz/=node_modules/@latticexyz/"])
 * @param rootDir The root directory to resolve relative to
 * @returns The resolved file path, or the original path if no remapping applies
 */
export function resolveRemapping(importPath: string, remappings: string[], rootDir: string): string {
  // Parse remappings into { from, to } objects
  const parsedRemappings = remappings.map((remapping) => {
    const [from, to] = remapping.split("=");
    return { from, to };
  });

  // Sort by length descending to match longest prefix first
  parsedRemappings.sort((a, b) => b.from.length - a.from.length);

  // Find the first matching remapping
  for (const { from, to } of parsedRemappings) {
    if (importPath.startsWith(from)) {
      // Replace the prefix with the mapped path
      const resolvedPath = importPath.replace(from, to);
      // Resolve to absolute path
      return path.resolve(rootDir, resolvedPath);
    }
  }

  // No remapping found, return original path
  return importPath;
}
