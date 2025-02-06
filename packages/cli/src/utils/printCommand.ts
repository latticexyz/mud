import chalk from "chalk";
import { ChildProcess } from "node:child_process";

/**
 * Prints the command used to spawn a child process
 * and returns the child process.
 *
 * Using it like this
 *
 * ```ts
 * printCommand(execa("echo", ["hello"]));
 * ```
 *
 * will output
 *
 * ```plain
 * > echo hello
 * ```
 */
export function printCommand<proc>(proc: proc extends ChildProcess ? proc : ChildProcess): proc {
  console.log("\n" + chalk.gray("> " + proc.spawnargs.join(" ")));
  return proc as never;
}
