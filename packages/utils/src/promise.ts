/* eslint-disable @typescript-eslint/no-explicit-any */
import { deferred } from "./deferred";
import { sleep } from "./sleep";

export const range = function* (total = 0, step = 1, from = 0) {
  // eslint-disable-next-line no-empty
  for (let i = 0; i < total; yield from + i++ * step) {}
};

export async function rejectAfter<T>(ms: number, msg: string): Promise<T> {
  await sleep(ms);
  throw new Error(msg);
}

export const timeoutAfter = async <T>(promise: Promise<T>, ms: number, timeoutMsg: string) => {
  return Promise.race([promise, rejectAfter<T>(ms, timeoutMsg)]);
};

export const callWithRetry = <T>(
  fn: (...args: any[]) => Promise<T>,
  args: any[] = [],
  maxRetries = 10,
  retryInterval = 1000
): Promise<T> => {
  const [resolve, reject, promise] = deferred<T>();
  const process = async () => {
    let res: T;
    for (let i = 0; i < maxRetries; i++) {
      try {
        res = await fn(...args);
        resolve(res);
        break;
      } catch (e) {
        if (i < maxRetries - 1) {
          console.info("[CallWithRetry Failed] attempt number=" + i, fn);
          console.error(e);
          await sleep(Math.min(retryInterval * 2 ** i + Math.random() * 100, 15000));
        } else {
          reject(e as unknown as Error);
        }
      }
    }
  };
  process();
  return promise;
};
