import { Hex, TransactionReceipt } from "viem";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { useCallback, useMemo } from "react";

export type DepositBase = {
  readonly type: "transfer" | "relay";
  readonly amount: bigint;
  readonly chainL1Id: number;
  readonly chainL2Id: number;
  readonly start: Date;
  readonly estimatedTime: number;
  readonly isComplete: Promise<void>;
};

export type TransferDeposit = Omit<DepositBase, "type"> & {
  readonly type: "transfer";
  readonly hash: Hex;
  readonly receipt: Promise<TransactionReceipt>;
};

export type RelayDeposit = Omit<DepositBase, "type"> & {
  readonly type: "relay";
  readonly requestId: Hex;
  readonly depositPromise: Promise<unknown>;
};

export type Deposit = DepositBase & (TransferDeposit | RelayDeposit);

const store = createStore<{
  readonly count: number;
  readonly deposits: readonly (Deposit & { readonly uid: string })[];
}>(() => ({
  count: 0,
  deposits: [],
}));

export function useDeposits() {
  const deposits = useStore(store, (state) => state.deposits);
  const addDeposit = useCallback((transaction: Deposit) => {
    store.setState((state) => {
      if (transaction.type === "relay") {
        const existingDeposit = state.deposits.find(
          (deposit) => deposit.type === "relay" && deposit.requestId === transaction.requestId,
        );

        if (existingDeposit) {
          return state;
        }
      }

      return {
        count: state.count + 1,
        deposits: [
          ...state.deposits,
          {
            ...transaction,
            uid: `deposit-${state.count}`,
          },
        ],
      };
    });
  }, []);

  const removeDeposit = useCallback((uid: string) => {
    store.setState((state) => ({
      deposits: state.deposits.filter((deposit) => deposit.uid !== uid),
    }));
  }, []);

  return useMemo(
    () => ({
      deposits,
      addDeposit,
      removeDeposit,
    }),
    [addDeposit, deposits, removeDeposit],
  );
}
