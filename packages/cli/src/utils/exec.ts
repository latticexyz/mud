import { ChildProcess, exec as nodeExec, spawn } from "child_process";
import { deferred } from "./deferred";
/**
 * Await execution of bash scripts
 * @param command Bash script to execute
 * @returns Promise that resolves with exit code when script finished executing
 */
export async function exec(command: string): Promise<number> {
  const [resolve, , promise] = deferred<number>();

  const child = nodeExec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(error);
      console.error(stderr);
    }
    console.log(stdout);
  });

  child.on("exit", (code) => resolve(code ?? 0));

  return promise;
}

/**
 * Await execution of bash scripts
 * @param command Bash script to execute
 * @param options Args to pass to the script
 * @returns Promise that resolves with exit code when script finished executing
 */
export async function execLog(command: string, options: string[]): Promise<{ exitCode: number; child: ChildProcess }> {
  console.log("Cmd:");
  console.log([command, ...options].join(" "));
  const [resolve, , promise] = deferred<{ exitCode: number; child: ChildProcess }>();

  const child = spawn(command, options, { stdio: [process.stdin, process.stdout, process.stderr] });

  child.on("exit", (code) => resolve({ exitCode: code ?? 0, child }));

  return promise;
}
