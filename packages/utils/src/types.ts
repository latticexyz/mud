/* eslint-disable @typescript-eslint/no-explicit-any */
export type Func<A extends any[], R> = (...args: A) => R;
export type AsyncFunc<A extends any[], R> = R extends Promise<unknown> ? (...args: A) => R : (...args: A) => Promise<R>;

export type CachedValue<V, Proxied extends boolean> = Proxied extends true
  ? V extends Func<infer A, infer B>
    ? AsyncFunc<A, B>
    : V extends Record<string, any>
    ? Cached<V> & { proxied: true }
    : { proxied: true }
  : V extends Func<infer A, infer B>
  ? Func<A, B>
  : V extends Record<string, any>
  ? V
  : V & { proxied: false };

export type Cached<C> =
  | ({ proxied: false } & { [key in keyof C]: CachedValue<C[key], false> })
  | ({ proxied: true } & { [key in keyof C]: CachedValue<C[key], true> });

/**
 * @deprecated Use Awaited<T> instead
 */
export type PromiseValue<T> = Awaited<T>;

export type ValueOf<T extends object> = T[keyof T];

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Coord = {
  x: number;
  y: number;
};
