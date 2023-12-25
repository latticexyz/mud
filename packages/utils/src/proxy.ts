/* eslint-disable @typescript-eslint/no-explicit-any */
import DeepProxy from "proxy-deep";
import { deferred } from "./deferred";
import { isFunction, isObject } from "./guards";
import { Cached } from "./types";
import { BehaviorSubject } from "rxjs";

function deepAccess(target: Record<string, unknown>, path: string[]): any {
  if (path.length === 0) return target;
  if (path.length === 1) return target[path[0]];
  const [next, ...rest] = path;
  const nextTarget = target[next];
  if (!isObject(nextTarget)) throw new Error("Path does not exist on the target");
  return deepAccess(nextTarget, rest);
}

/**
 * Caches any function calls to the target until the target is ready.
 * @param target$ T extends Cachable
 * @returns Cached<T>
 */
export function cacheUntilReady<T extends Record<string, any> | undefined>(target$: BehaviorSubject<T>): Cached<T> {
  const callQueue: {
    path: string[];
    args?: any[];
    resolve: (result: any) => void;
    reject: (e: Error) => void;
  }[] = [];

  const proxiedTarget = new DeepProxy(
    {},
    {
      get(_t, prop) {
        const targetReady = target$.getValue();
        if (targetReady) {
          if (prop === "proxied") return false;
          return Reflect.get(targetReady, prop);
        } else {
          if (prop === "proxied") return true;
          if (prop === "name") return "ProxiedTarget";
          if (prop === "toJSON") return () => ({ proxied: true });
          return this.nest(() => void 0);
        }
      },
      apply(_, thisArg, args) {
        const targetReady = target$.getValue();
        if (targetReady) {
          const targetFunc = deepAccess(targetReady, this.path);
          if (!isFunction(targetFunc)) throw new Error("Target is not callable");
          return Reflect.apply(targetFunc, thisArg, args);
        } else {
          const [resolve, reject, promise] = deferred();
          callQueue.push({ path: this.path, args, resolve, reject });
          return promise;
        }
      },
    }
  );

  target$.subscribe((targetReady) => {
    if (!targetReady) return;
    const queuedCalls = callQueue.splice(0);
    for (const { path, args, resolve, reject } of queuedCalls) {
      const target = deepAccess(targetReady, path);
      if (args && isFunction(target)) {
        (async () => {
          try {
            resolve(await target(...args));
          } catch (e: any) {
            reject(e);
          }
        })();
      } else {
        resolve(target);
      }
    }
  });

  return proxiedTarget as Cached<T>;
}
