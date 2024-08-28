import { Hex } from "viem";
import { createStore } from "zustand";
import { ACCOUNTS } from "../consts";

export type AppStore = {
  account: Hex;
  setAccount: (account: Hex) => void;
};

export const createAppStore = () => {
  return createStore<AppStore>()((set) => ({
    account: ACCOUNTS[0],
    setAccount: (account) => set({ account }),
  }));
};
