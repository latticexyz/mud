import path from "node:path";
import { glob } from "glob";
import { World } from "../config/v2/output";

export async function getContracts({ configPath, config }: { configPath: string; config: World }) {
  const files = await glob(path.join(config.sourceDirectory, "**", "*.sol"), {
    cwd: path.dirname(configPath),
  });

  return files.sort().map((source) => ({
    source,
    name: path.basename(source, ".sol"),
  }));
}
