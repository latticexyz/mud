import { execa } from "execa";

export interface ForgeConfig {
  // project
  src: string;
  test: string;
  out: string;
  libs: string[];

  // all unspecified keys (this interface is far from comprehensive)
  [key: string]: any;
}

/**
 * Get forge config as a parsed json object.
 */
export async function getForgeConfig() {
  const { stdout } = await execa("forge", ["config", "--json"], { stdio: ["inherit", "pipe", "pipe"] });

  return JSON.parse(stdout) as ForgeConfig;
}
