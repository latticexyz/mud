import { Hex, CallReturnType, PublicClient, Chain } from "viem";
import { getTransaction } from "./getTransaction";
import { getTransactionReceipt } from "./getTransactionReceipt";

// TODO: something about this fails when doing lots of simultaneous requests for transactions
//       not sure if its viem or failed RPC requests or what, but the promises get stuck/never resolve

// TODO: use IndexedDB cache for these?

type CacheKey = `${number}:${Hex}`;
const cache: Record<CacheKey, Promise<CallReturnType>> = {};

export const getTransactionResult = (publicClient: PublicClient & { chain: Chain }, hash: Hex) => {
  const key: CacheKey = `${publicClient.chain.id}:${hash}`;
  if (!cache[key]) {
    const transaction = getTransaction(publicClient, hash);
    const transactionReceipt = getTransactionReceipt(publicClient, hash);
    cache[key] = Promise.all([transaction, transactionReceipt]).then(
      ([tx, receipt]) =>
        publicClient.call({
          account: tx.from,
          to: tx.to!,
          data: tx.input,
          value: tx.value,
          blockNumber: receipt.blockNumber,
          // TODO: do we need to include nonce, gas price, etc. to properly simulate?
        })
      // TODO: catch and parse errors with worldAbi
    );
  }
  return cache[key];
};
