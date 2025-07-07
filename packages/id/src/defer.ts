export type Deferred<T> = PromiseWithResolvers<T> & {
  readonly fulfilled: boolean;
};

export function defer<T>(): Deferred<T> {
  const promise = Promise.withResolvers<T>();

  const deferred = {
    ...promise,
    fulfilled: false as boolean,
    resolve(...args) {
      deferred.fulfilled = true;
      promise.resolve(...args);
    },
    reject(...args) {
      deferred.fulfilled = true;
      promise.reject(...args);
    },
  } satisfies Deferred<T>;

  return deferred;
}
