import { Address } from "viem";
import { createStore } from "zustand/vanilla";

export type SharedState = {
  readonly accounts: readonly Address[];
};

export const sharedState = createStore<SharedState>(() => ({
  accounts: [],
}));
