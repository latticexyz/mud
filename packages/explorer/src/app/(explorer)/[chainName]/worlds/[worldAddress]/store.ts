import { createStore } from "zustand";
import { ObservedTransaction } from "./observe/useMergedTransactions";

export type State = {
  transactions: ObservedTransaction[];
  setTransaction: (transaction: ObservedTransaction) => void;
  updateTransaction: (hash: string, updatedTransaction: Partial<ObservedTransaction>) => void;
};

export const store = createStore<State>()((set) => ({
  transactions: [],
  setTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),
  updateTransaction: (hash: string, updatedTransaction: Partial<ObservedTransaction>) =>
    set((state) => ({
      transactions: state.transactions.map((tx) => (tx.hash === hash ? { ...tx, ...updatedTransaction } : tx)),
    })),
}));
