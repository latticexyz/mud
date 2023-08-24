import { useEffect, useRef, useState } from "react";

// TODO: narrow type so `null`/`undefined` always return `{status: "idle"}`?

export type UsePromiseResult<T> = PromiseSettledResult<Awaited<T>> | { status: "pending" } | { status: "idle" };

export function usePromise<T>(promise: PromiseLike<T> | null | undefined) {
  const promiseRef = useRef(promise);
  const [result, setResult] = useState<UsePromiseResult<T>>(
    promise == null ? { status: "idle" } : { status: "pending" }
  );

  useEffect(() => {
    if (promise !== promiseRef.current) {
      promiseRef.current = promise;
      setResult(promise == null ? { status: "idle" } : { status: "pending" });
    }
  }, [promise]);

  useEffect(() => {
    if (promise == null) return;
    // TODO: do we need to check if result is already populated?
    Promise.allSettled([promise]).then(([settled]) => {
      if (promise === promiseRef.current) {
        setResult(settled);
      }
    });
  }, [promise]);

  return result;
}
