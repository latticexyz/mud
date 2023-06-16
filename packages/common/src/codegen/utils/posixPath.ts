/**
 * Explicitly normalize a given path to a posix path (using `/` as separator).
 * This should be used for generating Solidity files that will be consumed by solc,
 * because solc expects `/` as path separator, but path.join produces `\` if the user is on windows.
 */
export function posixPath(path: string) {
  return path.replace(/\\/g, "/");
}
