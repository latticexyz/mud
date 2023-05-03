import { Hex, Transaction, TransactionReceipt } from "viem";
import { useStore } from "./useStore";

// TODO: something about this fails when doing lots of simultaneous requests for transactions
//       not sure if its viem or failed RPC requests or what, but the promises get stuck/never resolve

// TODO: use IndexedDB cache for these?

const transactionCache: Record<
  Hex,
  {
    transaction: Promise<Transaction>;
    transactionReceipt: Promise<TransactionReceipt>;
  }
> = {};

const getTransaction = (hash: Hex) => {
  const cached = transactionCache[hash];
  if (cached) return cached;

  const { publicClient } = useStore.getState();
  if (!publicClient) {
    throw new Error(`No public client to fetch transaction (tx: ${hash})`);
  }

  const transaction = publicClient.getTransaction({ hash });
  const transactionReceipt = publicClient.waitForTransactionReceipt({ hash });
  // TODO: handle tx replacements?

  transactionCache[hash] = { transaction, transactionReceipt };
  return transactionCache[hash];
};

export function useTransaction(hash: Hex) {
  const { transaction: transactionPromise, transactionReceipt: transactionReceiptPromise } = getTransaction(hash);
  return { transactionPromise, transactionReceiptPromise };
}
