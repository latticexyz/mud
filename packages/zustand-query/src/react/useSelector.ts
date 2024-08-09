import { useEffect, useRef, useState } from "react";
import { State, Store } from "../common";
import { subscribeStore } from "../actions";

export function useSelector<store extends Store, T>(
  store: store,
  selector: (store: State) => T,
  equals: (a: T, b: T) => boolean = (a, b) => a === b,
): T {
  const state = useRef(selector(store.get()));
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeStore({
      store,
      subscriber: () => {
        const nextState = selector(store.get());
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
