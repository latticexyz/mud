import path from "node:path/posix";
import { glob } from "glob";

// TODO: move to common codegen?
export async function findSolidityFiles({ cwd, pattern = "**" }: { cwd?: string; pattern: string }) {
  const files = await glob(path.join(pattern, "*.sol"), { cwd, posix: true });
  return files.sort().map((filename) => ({
    filename,
    basename: path.basename(filename, ".sol"),
  }));
}
