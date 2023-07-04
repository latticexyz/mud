import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

/**
 * Use in place of useState when the component may be unmounted before the state is updated.
 */
export function useMountedState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialState);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  });
  const mountedSetState: typeof setState = useCallback((...args) => {
    if (mountedRef.current) {
      setState(...args);
    } else {
      console.warn("Ignoring `setState` call because component unmounted", ...args);
    }
  }, []);
  return [state, mountedSetState];
}
