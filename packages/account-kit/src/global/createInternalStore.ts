import { StoreApi, createStore } from "zustand/vanilla";

export type InternalState = {
  rootContainer: Element | undefined;
  buttonContainers: readonly Element[];
};

export type InternalStore = StoreApi<InternalState>;

export function createInternalStore() {
  return createStore<InternalState>(() => ({
    rootContainer: undefined,
    buttonContainers: [],
  }));
}