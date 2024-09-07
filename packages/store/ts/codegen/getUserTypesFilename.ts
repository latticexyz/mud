import path from "node:path/posix";
import { Store } from "../config/v2";

/**
 * @returns File path for codegen'ed user types, relative to source dir
 */
export function getUserTypesFilename({ config }: { config: Store }): string {
  return path.join(config.sourceDirectory, config.codegen.outputDirectory, config.codegen.userTypesFilename);
}
