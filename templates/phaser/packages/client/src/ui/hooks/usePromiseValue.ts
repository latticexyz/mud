import { useEffect, useState, useRef } from "react";

export const usePromiseValue = <T>(promise: Promise<T> | null) => {
  const promiseRef = useRef<typeof promise>(promise);
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    if (!promise) return;
    let isMounted = true;
    promiseRef.current = promise;
    // TODO: do something with promise errors?
    promise.then((resolvedValue) => {
      // skip if unmounted (state changes will cause errors otherwise)
      if (!isMounted) return;
      // If our promise was replaced before it resolved, ignore the result
      if (promiseRef.current !== promise) return;

      setValue(resolvedValue);
    });
    return () => {
      isMounted = false;
    };
  }, [promise]);
  return value;
};
