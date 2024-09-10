import { createStore } from "zustand";

export type AppStoreData = {};

export const createAppStore = () => {
  return createStore<AppStoreData>()(() => ({}));
};
