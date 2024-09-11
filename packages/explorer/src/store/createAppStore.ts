import { createStore } from "zustand";

export type AppStoreData = {};

// TODO: remove
export const createAppStore = () => {
  return createStore<AppStoreData>()(() => ({}));
};
