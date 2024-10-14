import { createStore } from "zustand";
import { WatchedTransaction } from "../observe/useTransactionsWatcher";

export type AppStoreData = {
  transactions: WatchedTransaction[];
  setTransaction: (transaction: WatchedTransaction) => void;
  updateTransaction: (hash: string, updatedTransaction: Partial<WatchedTransaction>) => void;
};

export const createWorldStore = () => {
  return createStore<AppStoreData>()((set) => ({
    transactions: [],
    setTransaction: (transaction) =>
      set((state) => ({
        transactions: [...state.transactions, transaction],
      })),
    updateTransaction: (hash: string, updatedTransaction: Partial<WatchedTransaction>) =>
      set((state) => ({
        transactions: state.transactions.map((tx) => (tx.hash === hash ? { ...tx, ...updatedTransaction } : tx)),
      })),
  }));
};
