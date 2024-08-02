import { fromHex, Hex } from "viem";
import { create } from "zustand";
import { ACCOUNTS } from "./consts";

type Balances = {
  [key: string]: bigint;
};

type BalanceResponse = {
  id: number;
  result: Hex;
};

type Store = {
  account: Hex;
  setAccount: (account: Hex) => void;

  balances: Balances;
  fetchBalances: () => void;
};

export const useStore = create<Store>((set) => ({
  account: ACCOUNTS[0],
  setAccount: (account) => set({ account }),

  balances: {},
  fetchBalances: async () => {
    try {
      const requests = ACCOUNTS.map((account, i) => ({
        method: "eth_getBalance",
        params: [account, "latest"],
        id: i,
        jsonrpc: "2.0",
      }));

      const response = await fetch("http://127.0.0.1:8545", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requests),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BalanceResponse[] = await response.json();
      const fetchedBalances: Balances = {};
      for (let i = 0; i < data.length; i++) {
        fetchedBalances[ACCOUNTS[i]] = fromHex(data[i].result, "bigint");
      }

      set({ balances: fetchedBalances });
    } catch (error) {
      console.error("Error:", error);
    }
  },
}));
