import { execa } from "execa";
import { execLog } from "./execLog.js";

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

/**
 * Execute a forge command
 * @param args The arguments to pass to forge
 * @returns Stdout of the command
 */
export async function forge(...args: string[]): Promise<string> {
  return execLog("forge", args);
}

/**
 * Execute a cast command
 * @param args The arguments to pass to cast
 * @returns Stdout of the command
 */
export async function cast(...args: string[]): Promise<string> {
  return execLog("cast", args);
}
