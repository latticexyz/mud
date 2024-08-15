import { useEffect, useRef, useState } from "react";
import { State, Stash, StoreConfig } from "../common";
import { subscribeStore } from "../actions";

export function useSelector<config extends StoreConfig, T>(
  stash: Stash<config>,
  selector: (stash: State<config>) => T,
  equals: (a: T, b: T) => boolean = (a, b) => a === b,
): T {
  const state = useRef(selector(stash.get()));
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeStore({
      stash,
      subscriber: () => {
        const nextState = selector(stash.get());
        if (!equals(state.current, nextState)) {
          state.current = nextState;
          forceUpdate({});
        }
      },
    });
    return unsubscribe;
  }, []);

  return state.current;
}
