import { Hex } from "viem";
import { create } from "zustand";
import { ACCOUNTS } from "./consts";

type Store = {
  account: Hex;
  setAccount: (account: Hex) => void;
};

export const useStore = create<Store>((set) => ({
  account: ACCOUNTS[0],
  setAccount: (account) => set({ account }),
}));
