// Solidity compiler expects POSIX paths
import path from "node:path/posix";

export function renderImportPath(basePath: string, ...segments: readonly string[]): string {
  const fullPath = path
    .join(basePath, ...segments)
    // remove trailing slash
    .replace(/\/$/, "");

  // `path.join` strips the leading `./`
  // so if we started with a relative path, make it relative again
  if (basePath.startsWith(".")) {
    const relativePath = "./" + fullPath;
    return relativePath.replace(/^(\.\/)+\./, ".");
  }

  return fullPath;
}
