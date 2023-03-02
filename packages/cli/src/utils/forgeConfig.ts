import { execa } from "execa";

export interface ForgeConfig {
  // project
  src: string;
  test: string;
  script: string;
  out: string;
  libs: string[];

  // all unspecified keys (this interface is far from comprehensive)
  [key: string]: unknown;
}

/**
 * Get forge config as a parsed json object.
 */
export async function getForgeConfig() {
  const { stdout } = await execa("forge", ["config", "--json"], { stdio: ["inherit", "pipe", "pipe"] });

  return JSON.parse(stdout) as ForgeConfig;
}

/**
 * Get the value of "src" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
export async function getSrcDirectory() {
  return (await getForgeConfig()).src;
}

/**
 * Get the value of "script" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
export async function getScriptDirectory() {
  return (await getForgeConfig()).script;
}

/**
 * Get the value of "test" from forge config.
 * The path to the test contract sources relative to the root of the project.
 */
export async function getTestDirectory() {
  return (await getForgeConfig()).test;
}

/**
 * Get the value of "out" from forge config.
 * The path to put contract artifacts in, relative to the root of the project.
 */
export async function getOutDirectory() {
  return (await getForgeConfig()).out;
}
