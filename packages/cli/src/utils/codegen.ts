import path from "path";
import { getForgeConfig } from "./foundry.js";

/**
 * The directory that all MUD auto-generated files are placed in.
 */
export async function getCodegenDirectory(profile?: string) {
  const srcDirectory = (await getForgeConfig(profile)).src;
  return path.join(srcDirectory, "codegen");
}
