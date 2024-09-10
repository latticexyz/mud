import { Hex } from "viem";
import { createStore } from "zustand";
import { ANVIL_ACCOUNTS } from "../consts";

export type AppStoreData = {
  account: Hex;
  setAccount: (account: Hex) => void;
};

export const createAppStore = () => {
  return createStore<AppStoreData>()((set) => ({
    account: ANVIL_ACCOUNTS[0],
    setAccount: (account) => set({ account }),
  }));
};
