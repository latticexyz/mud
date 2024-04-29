import { Chain, Hex, TransactionReceipt, TransactionType } from "viem";
import { createStore } from "zustand/vanilla";
import { satisfy } from "@latticexyz/common/type-utils";
import { useStore } from "zustand";
import { useCallback, useMemo } from "react";

// TODO: fill in other types
export type DepositTransactionType = "bridge";
export type DepositTransactionBase = { readonly type: TransactionType; readonly uid: string };

export type BridgeTransaction = {
  readonly type: "bridge";
  readonly uid: string;
  readonly amount: bigint;
  readonly chainL1: Pick<Chain, "id" | "name" | "blockExplorers">;
  readonly chainL2: Pick<Chain, "id" | "name" | "blockExplorers">;
  readonly hashL1: Hex;
  readonly receiptL1: Promise<{ receiptL1: TransactionReceipt; hashL2: Hex }>;
  readonly receiptL2: Promise<TransactionReceipt>;
  readonly start: Date;
  readonly estimatedTime: number;
};

export type DepositTransaction = satisfy<DepositTransactionBase, BridgeTransaction>;

const store = createStore<{
  readonly transactions: readonly DepositTransaction[];
}>(() => ({
  transactions: [
    // {
    //   type: "bridge",
    //   amount: parseEther("0.01"),
    //   chainL1: holesky,
    //   chainL2: garnet,
    //   hashL1: "0x8f0987b82756f2e7df50fcbb302693e21aea823e0afac312c91fff052ce259d8",
    //   receiptL1: wait(5_000).then(() => ({}) as never),
    //   receiptL2: wait(15_000).then(() => ({}) as never),
    //   start: new Date(),
    //   estimatedTime: 1000 * 60 * 3,
    // },
  ],
}));

export function useDepositTransactions() {
  const transactions = useStore(store, (state) => state.transactions);

  // TODO: allow specifying a time to automatically remove after successful?

  const addTransaction = useCallback((transaction: DepositTransaction) => {
    store.setState((state) => ({
      transactions: [...state.transactions, transaction],
    }));
  }, []);

  return useMemo(
    () => ({
      transactions,
      addTransaction,
    }),
    [addTransaction, transactions],
  );
}
