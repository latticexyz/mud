/* eslint-disable @typescript-eslint/no-explicit-any */
import { IComputedValue, IObservableValue, reaction } from "mobx";
import DeepProxy from "proxy-deep";
import { deferred } from "./deferred";
import { isFunction, isObject } from "./guards";
import { Cached } from "./types";

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
 * @param target T extends Cachable
 * @returns Cached<T>
 */
export function cacheUntilReady<T extends Record<string, any>>(
  target: IObservableValue<T | undefined> | IComputedValue<T | undefined>
): Cached<T> {
  // The call queue contains the path and arguments of calls to the
  // proxiedTarget while the target was not available yet.
  // It also contains resolve and reject methods to fulfil the promise
  // returned when calling the proxiedTarget once the target becomes available.
  const callQueue: {
    path: string[];
    args?: any[];
    resolve: (result: any) => void;
    reject: (e: Error) => void;
  }[] = [];

  // The proxiedTarget proxies all calls to the target.
  // If a function is called on the proxiedTarget while the target is not
  // available, a promise is returned and the call will be stored in the callQueue
  // until the target becomes available and the promise is fulfilled.
  const proxiedTarget = new DeepProxy(
    {},
    {
      get(_t, prop) {
        const targetReady = target.get();
        if (targetReady) {
          // If the target is ready, relay all calls directly to the target
          // (Except for the "proxied" key, which indicates whether the object is currently proxied)
          if (prop === "proxied") return false;
          return Reflect.get(targetReady, prop);
        } else {
          // Note: if the target is not available, accessing a property returns another proxy,
          // not a Promise. It is possible to check whether a value is currently proxied using the proxied key.
          if (prop === "proxied") return true;
          if (prop === "name") return "ProxiedTarget";
          if (prop === "toJSON") return () => ({ proxied: true });
          return this.nest(() => void 0);
        }
      },
      apply(_, thisArg, args) {
        const targetReady = target.get();
        if (targetReady) {
          // If the target is ready, relay all calls directly to the target
          const targetFunc = deepAccess(targetReady, this.path);
          if (!isFunction(targetFunc)) throw new Error("Target is not callable");
          return Reflect.apply(targetFunc, thisArg, args);
        } else {
          // Otherwise store the call and relay it to the target later once it's ready.
          // The return value of this call is a promise, that gets resolved once the target is ready.
          const [resolve, reject, promise] = deferred();
          callQueue.push({ path: this.path, args, resolve, reject });
          return promise;
        }
      },
    }
  );

  reaction(
    () => target.get(),
    (targetReady) => {
      if (!targetReady) return;
      // Move all entries from callQueue to queuedCalls
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
    }
  );

  return proxiedTarget as Cached<T>;
}
