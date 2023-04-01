import { execa } from "execa";

/**
 * Wrapper for execa that logs the full command.
 * @param command - The program/script to execute.
 * @param options - Arguments to pass to `command` on execution.
 * @returns A [`child_process` instance](https://nodejs.org/api/child_process.html#child_process_class_childprocess), which is enhanced to also be a `Promise` for a result `Object` with `stdout` and `stderr` properties.
 */
export function execLog(command: string, options: string[]) {
  console.log("Cmd:");
  console.log([command, ...options].join(" "));

  // TODO piping outputs and doing custom logging would be better for readability
  // (see https://github.com/latticexyz/mud/issues/446)
  return execa(command, options, {
    stdio: ["inherit", "inherit", "inherit"],
  });
}
