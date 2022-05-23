import { exec as nodeExec } from "child_process";
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
 * @returns Promise that resolves when script finished executing
 */
export async function exec(command: string): Promise<void> {
  const [resolve, , promise] = deferred<void>();

  const child = nodeExec(command, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(error);
      console.error(stderr);
    }
    console.log(stdout);
  });

  child.on("close", () => resolve());

  return promise;
}
