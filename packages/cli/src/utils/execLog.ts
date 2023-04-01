import chalk from "chalk";
import { execa, Options } from "execa";
import { CommandFailedError } from "./errors.js";

/**
 * Executes the given command, returns the stdout, and logs the command to the console.
 * Throws an error if the command fails.
 * @param command The command to execute
 * @param args The arguments to pass to the command
 * @returns The stdout of the command
 */
export async function execLog(command: string, args: string[], options?: Options<string>): Promise<string> {
  const commandString = `${command} ${args.join(" ")}`;
  try {
    console.log(chalk.gray(`running "${commandString}"`));
    const { stdout } = await execa(command, args, { stdout: "pipe", stderr: "pipe", ...options });
    return stdout;
  } catch (error: any) {
    let errorMessage = error?.stderr || error?.message || "";
    errorMessage += chalk.red(`\nError running "${commandString}"`);
    throw new CommandFailedError(errorMessage);
  }
}
