import { Hex, TransactionReceipt } from "viem";
import { createStore } from "zustand/vanilla";
import { satisfy } from "@latticexyz/common/type-utils";
import { useStore } from "zustand";
import { useCallback, useMemo } from "react";

// TODO: fill in other types
export type DepositType = "transfer" | "bridge" | "relay";
export type DepositBase = {
  readonly type: DepositType;
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
  readonly depositPromise: Promise<unknown>;
};

export type Deposit = satisfy<DepositBase, TransferDeposit | RelayDeposit>;

const store = createStore<{
  readonly count: number;
  readonly deposits: readonly (Deposit & { readonly uid: string })[];
}>(() => ({
  count: 0,
  deposits: [
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

export function useDeposits() {
  const deposits = useStore(store, (state) => state.deposits);

  // TODO: allow specifying a time to automatically remove after successful?
  const addDeposit = useCallback((transaction: Deposit) => {
    store.setState((state) => ({
      count: state.count + 1,
      deposits: [
        ...state.deposits,
        {
          ...transaction,
          uid: `deposit-${state.count}`,
        },
      ],
    }));
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
