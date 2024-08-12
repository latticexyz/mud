import path from "node:path";

// This will probably break for backslash-escaped POSIX paths,
// but we'll worry about that later.
function winToPosix(segment: string): string {
  return segment.replaceAll(path.win32.sep, path.posix.sep);
}

export function renderImportPath(basePath: string, ...segments: readonly string[]): string {
  // Solidity compiler expects POSIX paths
  const fullPath = path.posix
    .join(winToPosix(basePath), ...segments.map(winToPosix))
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
