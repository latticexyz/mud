import { deferred } from "@mudkit/utils";
import { Time } from "./time";

/**
 * @param miliseconds Time until the promise resolves.
 * @returns A promise that resolves after the specified time.
 */
export async function sleep(miliseconds: number) {
  const [resolve, , promise] = deferred<void>();
  Time.time.setTimeout(resolve, miliseconds);
  return promise;
}
