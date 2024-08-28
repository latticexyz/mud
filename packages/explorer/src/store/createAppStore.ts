import { Hex } from "viem";
import { createStore } from "zustand";
import { ACCOUNTS } from "../consts";

export type AppStoreData = {
  account: Hex;
  setAccount: (account: Hex) => void;
};

export const createAppStore = () => {
  return createStore<AppStoreData>()((set) => ({
    account: ACCOUNTS[0],
    setAccount: (account) => set({ account }),
  }));
};
