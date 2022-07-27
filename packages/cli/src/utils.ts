import { exec as nodeExec, spawn } from "child_process";
import { keccak256 as keccak256Bytes, toUtf8Bytes } from "ethers/lib/utils";
import { readFileSync } from "fs";

export const IDregex = new RegExp(/(?<=uint256 constant ID = uint256\(keccak256\(")(.*)(?="\))/);

/**
 * A convenient way to create a promise with resolve and reject functions.
 * @returns Tuple with resolve function, reject function and promise.
 */
export function deferred<T>(): [(t: T) => void, (t: Error) => void, Promise<T>] {
  let resolve: ((t: T) => void) | null = null;
  let reject: ((t: Error) => void) | null = null;
  const promise = new Promise<T>((r, rj) => {
    resolve = (t: T) => r(t);
    reject = (e: Error) => rj(e);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [resolve as any, reject as any, promise];
}

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
export async function execLog(command: string, options: string[]): Promise<number> {
  console.log("Cmd:");
  console.log([command, ...options].join(" "));
  const [resolve, , promise] = deferred<number>();

  const child = spawn(command, options, { stdio: [process.stdin, process.stdout, process.stderr] });

  child.on("exit", (code) => resolve(code ?? 0));

  return promise;
}

export function extractIdFromFile(path: string): string | null {
  const content = readFileSync(path).toString();
  const regexResult = IDregex.exec(content);
  return regexResult && regexResult[0];
}

export function keccak256(data: string) {
  return keccak256Bytes(toUtf8Bytes(data));
}
