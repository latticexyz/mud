export type Deferred<T> = {
  readonly resolve: (t: T) => void;
  readonly reject: (t: Error) => void;
  readonly promise: Promise<T>;
  readonly state: "pending" | "fulfilled" | "rejected";
};

export function defer<T>(): Deferred<T> {
  const deferred: {
    -readonly [key in keyof Deferred<T>]?: Deferred<T>[key];
  } = {};

  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.state = "pending";
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  deferred.promise.then(
    () => {
      deferred.state = "fulfilled";
    },
    () => {
      deferred.state = "rejected";
    },
  );

  return deferred as never;
}
