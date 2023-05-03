import { Hex, Transaction, TransactionReceipt } from "viem";
import { useStore } from "./useStore";
import { useObservableValue } from "@latticexyz/react";
import { from } from "rxjs";

const transactionCache: Partial<
  Record<
    Hex,
    {
      transaction: Promise<Transaction>;
      transactionReceipt: Promise<TransactionReceipt>;
    }
  >
> = {};

const getTransaction = (hash: Hex) => {
  const cached = transactionCache[hash];
  if (cached) return cached;

  const { publicClient } = useStore.getState();
  if (!publicClient) {
    console.log("No public client to fetch transaction", hash);
    return;
  }

  const transaction = publicClient.getTransaction({ hash });
  const transactionReceipt = publicClient.waitForTransactionReceipt({ hash });
  // TODO: handle tx replacements?

  transactionCache[hash] = { transaction, transactionReceipt };
  return transactionCache[hash];
};

export function useTransaction(hash: Hex) {
  const { transaction: transactionPromise, transactionReceipt: transactionReceiptPromise } = getTransaction(hash) ?? {};
  const transaction = useObservableValue(from(transactionPromise ?? Promise.resolve(null)));
  const transactionReceipt = useObservableValue(from(transactionReceiptPromise ?? Promise.resolve(null)));
  return { transaction, transactionReceipt };
}
