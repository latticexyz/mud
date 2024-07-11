import { StoreApi } from "zustand";

// Zustand doesn't supported passing `ReadonlyStoreApi` into `useStore` (https://github.com/pmndrs/zustand/discussions/2581),
// so this is a bit of a polyfill to create a Store-like object that only supports getters.

// TODO: consider removing when https://github.com/pmndrs/zustand/discussions/2581 is fixed

export function freezeStore<T>(store: StoreApi<T>): StoreApi<T> {
  return Object.freeze<StoreApi<T>>({
    getState: () => store.getState(),
    getInitialState: () => store.getInitialState(),
    subscribe: (...args) => store.subscribe(...args),
    setState: () => {
      throw new Error("setState is not allowed in this readonly store");
    },
    destroy: () => {
      throw new Error("destroy is not allowed in this readonly store");
    },
  });
}
