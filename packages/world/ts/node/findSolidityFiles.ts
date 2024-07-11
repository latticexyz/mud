import path from "node:path";
import { glob } from "glob";
import { World } from "../config/v2/output";

export async function findSolidityFiles({ rootDir, config }: { rootDir: string; config: World }) {
  const files = await glob(path.join(config.sourceDirectory, "**", "*.sol"), {
    cwd: rootDir,
  });

  return files.sort().map((filename) => ({
    filename,
    basename: path.basename(filename, ".sol"),
  }));
}
