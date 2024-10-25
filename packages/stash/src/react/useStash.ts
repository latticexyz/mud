import { useDebugValue, useSyncExternalStore } from "react";
import { subscribeStash } from "../actions";
import { StoreConfig, Stash, State } from "../common";
import { isEqual } from "./isEqual";
import { memoize } from "./memoize";

export type UseStashOptions<T> = {
  /**
   * Optional equality function.
   * Must be a stable function, otherwise you may end up with this hook rerendering infinitely.
   * @default (a, b) => a === b
   */
  isEqual?: (a: T, b: T) => boolean;
};

export function useStash<config extends StoreConfig, T>(
  stash: Stash<config>,
  /**
   * Selector to pick values from state.
   * Be aware of the stability of both the `selector` and the return value, otherwise you may end up with unnecessary re-renders.
   */
  selector: (state: State<config>) => T,
  opts: UseStashOptions<T> = {},
): T {
  const slice = useSyncExternalStore(
    (subscriber) => subscribeStash({ stash, subscriber }),
    memoize(() => selector(stash.get()), opts.isEqual ?? isEqual),
  );
  useDebugValue(slice);
  return slice;
}
