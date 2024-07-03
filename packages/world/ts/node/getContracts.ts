import path from "node:path";
import { globSync } from "glob";
import { World as WorldConfig } from "../config/v2/output";

export function getContracts({ config, configPath }: { config: WorldConfig; configPath: string }) {
  return globSync("**/*.sol", { cwd: path.join(path.dirname(configPath), config.sourceDirectory) }).map((filename) => ({
    filename,
    name: path.basename(filename, ".sol"),
  }));
}
