import { execa, ExecaChildProcess, Options } from "execa";

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

// Execa options for Foundry commands
export interface FoundryExecOptions extends Options {
  silent?: boolean;
  profile?: string;
}

/**
 * Get forge config as a parsed json object.
 */
export async function getForgeConfig(opts?: FoundryExecOptions): Promise<ForgeConfig> {
  const { stdout } = await execa("forge", ["config", "--json"], {
    stdio: ["inherit", "pipe", "pipe"],
    ...getExecOptions(opts),
  });

  return JSON.parse(stdout) as ForgeConfig;
}

/**
 * Get the value of "src" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
export async function getSrcDirectory(opts?: FoundryExecOptions): Promise<string> {
  return (await getForgeConfig(opts)).src;
}

/**
 * Get the value of "script" from forge config.
 * The path to the contract sources relative to the root of the project.
 */
export async function getScriptDirectory(opts?: FoundryExecOptions): Promise<string> {
  return (await getForgeConfig(opts)).script;
}

/**
 * Get the value of "test" from forge config.
 * The path to the test contract sources relative to the root of the project.
 */
export async function getTestDirectory(opts?: FoundryExecOptions): Promise<string> {
  return (await getForgeConfig(opts)).test;
}

/**
 * Get the value of "out" from forge config.
 * The path to put contract artifacts in, relative to the root of the project.
 */
export async function getOutDirectory(opts?: FoundryExecOptions): Promise<string> {
  return (await getForgeConfig(opts)).out;
}

/**
 * Get the value of "eth_rpc_url" from forge config, default to "http://127.0.0.1:8545"
 * @param opts The options to pass to getForgeConfig
 * @returns The rpc url
 */
export async function getRpcUrl(opts?: FoundryExecOptions): Promise<string> {
  return (await getForgeConfig(opts)).eth_rpc_url || "http://127.0.0.1:8545";
}

/**
 * Execute a forge command
 * @param args The arguments to pass to forge
 * @param opts { profile?: The foundry profile to use; silent?: If true, nothing will be logged to the console }
 */
export async function forge(args: string[], opts?: FoundryExecOptions): Promise<string | ExecaChildProcess> {
  return execFoundry("forge", args, opts);
}

/**
 * Execute a cast command
 * @param args The arguments to pass to cast
 * @param options The execution options
 * @returns Stdout of the command
 */
export async function cast(args: string[], options?: FoundryExecOptions): Promise<string | ExecaChildProcess> {
  return execLog("cast", args, getExecOptions(options));
}

/**
 * Start an anvil chain
 * @param args The arguments to pass to anvil
 * @param options The execution options
 * @returns Stdout of the command
 */
export async function anvil(args: string[], options?: FoundryExecOptions): Promise<string | ExecaChildProcess> {
  return execFoundry("anvil", args, options);
}

/**
 * Execute a foundry command
 * @param command The command to execute
 * @param args The arguments to pass to the command
 * @param options The executable options. If `silent` is true, nothing will be logged to the console
 */
async function execFoundry(
  command: string,
  args: string[],
  options?: FoundryExecOptions,
): Promise<string | ExecaChildProcess> {
  const execOptions: Options<string> = {
    stdout: "inherit",
    stderr: "pipe",
    ...getExecOptions(options),
  };
  return options?.silent ? execa(command, args, execOptions) : execLog(command, args, execOptions);
}

/**
 * Executes the given command, returns the stdout, and logs the command to the console.
 * Throws an error if the command fails.
 * @param command The command to execute
 * @param args The arguments to pass to the command
 * @param options The executable options
 * @returns The stdout of the command
 */
async function execLog(command: string, args: string[], options?: Options<string>): Promise<string> {
  const commandString = `${command} ${args.join(" ")}`;
  try {
    console.log(`running "${commandString}"`);
    const { stdout } = await execa(command, args, { stdout: "pipe", stderr: "pipe", ...options });
    return stdout;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    let errorMessage = error?.stderr || error?.message || "";
    errorMessage += `\nError running "${commandString}"`;
    throw new Error(errorMessage);
  }
}

function getExecOptions({ profile, env, silent: _, ...opts }: FoundryExecOptions = {}): Options<string> {
  return {
    env: { FOUNDRY_PROFILE: profile, ...env },
    ...opts,
  };
}
