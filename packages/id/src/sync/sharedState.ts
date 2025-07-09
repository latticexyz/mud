import { createStore } from "zustand/vanilla";
import { sharedStateShape } from "./common";

export type SharedState = typeof sharedStateShape.infer & {
  lastUpdate: null | {
    by: "rp" | "client";
    at: Date;
  };
};

export const sharedState = createStore<SharedState>(() => ({
  accounts: [],
  lastUpdate: null,
}));
