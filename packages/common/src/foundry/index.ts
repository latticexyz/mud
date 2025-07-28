import { execa } from "execa";

export interface ForgeConfig {
  // project
  src: string;
  test: string;
  script: string;
  out: string;
  libs: string[];
  cache: boolean;
  cache_path: string;
  eth_rpc_url: string | null;

  // compiler
  remappings: string[];

  // all unspecified keys (this interface is far from comprehensive)
  [key: string]: unknown;
}

/**
 * Get forge config as a parsed json object.
 */
export async function getForgeConfig(profile?: string): Promise<ForgeConfig> {
  const { stdout } = await execa("forge", ["config", "--json"], {
    stdio: ["inherit", "pipe", "pipe"],
    env: { FOUNDRY_PROFILE: profile },
  });

  return JSON.parse(stdout) as ForgeConfig;
}

/**
 * Get the value of "src" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
export async function getSrcDirectory(profile?: string): Promise<string> {
  return (await getForgeConfig(profile)).src;
}

/**
 * Get the value of "script" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
export async function getScriptDirectory(profile?: string): Promise<string> {
  return (await getForgeConfig(profile)).script;
}

/**
 * Get the value of "test" from forge config.
 * The path to the test contract sources relative to the root of the project.
 */
export async function getTestDirectory(profile?: string): Promise<string> {
  return (await getForgeConfig(profile)).test;
}

/**
 * Get the value of "out" from forge config.
 * The path to put contract artifacts in, relative to the root of the project.
 */
export async function getOutDirectory(profile?: string): Promise<string> {
  return (await getForgeConfig(profile)).out;
}

/**
 * Get the value of "eth_rpc_url" from forge config, default to "http://127.0.0.1:8545"
 * @param profile The foundry profile to use
 * @returns The rpc url
 */
export async function getRpcUrl(profile?: string): Promise<string> {
  return (
    process.env.FOUNDRY_ETH_RPC_URL ||
    process.env.RPC_HTTP_URL ||
    process.env.RPC_URL ||
    (await getForgeConfig(profile)).eth_rpc_url ||
    "http://127.0.0.1:8545"
  );
}

/**
 * Get the remappings from forge config.
 * @param profile The foundry profile to use
 * @returns Array of remapping strings (e.g., ["@latticexyz/=node_modules/@latticexyz/"])
 */
export async function getRemappings(profile?: string): Promise<string[]> {
  return (await getForgeConfig(profile)).remappings;
}
