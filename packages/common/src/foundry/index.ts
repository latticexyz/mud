import { execa, Options } from "execa";
import chalk from "chalk";

export interface ForgeConfig {
  // project
  src: string;
  test: string;
  script: string;
  out: string;
  libs: string[];
  eth_rpc_url: string | null;

  // all unspecified keys (this interface is far from comprehensive)
  [key: string]: unknown;
}

/**
 * Get forge config as a parsed json object.
 */
export async function getForgeConfig(profile?: string) {
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
export async function getSrcDirectory(profile?: string) {
  return (await getForgeConfig(profile)).src;
}

/**
 * Get the value of "script" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
export async function getScriptDirectory(profile?: string) {
  return (await getForgeConfig(profile)).script;
}

/**
 * Get the value of "test" from forge config.
 * The path to the test contract sources relative to the root of the project.
 */
export async function getTestDirectory(profile?: string) {
  return (await getForgeConfig(profile)).test;
}

/**
 * Get the value of "out" from forge config.
 * The path to put contract artifacts in, relative to the root of the project.
 */
export async function getOutDirectory(profile?: string) {
  return (await getForgeConfig(profile)).out;
}

/**
 * Get the value of "eth_rpc_url" from forge config, default to "http://127.0.0.1:8545"
 * @param profile The foundry profile to use
 * @returns The rpc url
 */
export async function getRpcUrl(profile?: string) {
  return (await getForgeConfig(profile)).eth_rpc_url || "http://127.0.0.1:8545";
}

/**
 * Execute a forge command
 * @param args The arguments to pass to forge
 * @param options { profile?: The foundry profile to use; silent?: If true, nothing will be logged to the console }
 */
export async function forge(args: string[], options?: { profile?: string; silent?: boolean }): Promise<void> {
  const execOptions: Options<string> = {
    env: { FOUNDRY_PROFILE: options?.profile },
    stdout: "inherit",
    stderr: "pipe",
  };

  await (options?.silent ? execa("forge", args, execOptions) : execLog("forge", args, execOptions));
}

/**
 * Execute a cast command
 * @param args The arguments to pass to cast
 * @returns Stdout of the command
 */
export async function cast(args: string[], options?: { profile?: string }): Promise<string> {
  return execLog("cast", args, {
    env: { FOUNDRY_PROFILE: options?.profile },
  });
}

/**
 * Start an anvil chain
 * @param args The arguments to pass to anvil
 * @returns Stdout of the command
 */
export async function anvil(args: string[]): Promise<string> {
  return execLog("anvil", args);
}

/**
 * Executes the given command, returns the stdout, and logs the command to the console.
 * Throws an error if the command fails.
 * @param command The command to execute
 * @param args The arguments to pass to the command
 * @returns The stdout of the command
 */
async function execLog(command: string, args: string[], options?: Options<string>): Promise<string> {
  const commandString = `${command} ${args.join(" ")}`;
  try {
    console.log(chalk.gray(`running "${commandString}"`));
    const { stdout } = await execa(command, args, { stdout: "pipe", stderr: "pipe", ...options });
    return stdout;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    let errorMessage = error?.stderr || error?.message || "";
    errorMessage += chalk.red(`\nError running "${commandString}"`);
    throw new Error(errorMessage);
  }
}
