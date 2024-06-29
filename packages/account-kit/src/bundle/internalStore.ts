import { StoreApi, createStore } from "zustand/vanilla";

export type State = {
  rootContainer: Element | undefined;
  buttonContainers: readonly Element[];
};

export type Store = StoreApi<State>;

export const internalStore = createStore<State>(() => ({
  rootContainer: undefined,
  buttonContainers: [],
}));
