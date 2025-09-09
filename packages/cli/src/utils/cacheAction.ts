import { Client } from "viem";

const clientCache = new WeakMap<Client, Map<unknown, unknown>>();

export function cacheAction<client extends Client, args extends unknown[], returnType>(
  action: (client: client, ...args: args) => returnType,
  getKey: (...args: args) => unknown,
): typeof action {
  return (client: client, ...args: args) => {
    const resultCache =
      clientCache.get(client) ??
      (() => {
        const cache = new Map<unknown, unknown>();
        clientCache.set(client, cache);
        return cache;
      })();

    const key = getKey(...args);
    if (resultCache.has(key)) return resultCache.get(key) as never;

    const result = action(client, ...args);
    resultCache.set(key, result);
    return result;
  };
}
