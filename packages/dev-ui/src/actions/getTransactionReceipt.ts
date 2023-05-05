import { Hex, TransactionReceipt, PublicClient, Chain } from "viem";

// TODO: something about this fails when doing lots of simultaneous requests for transactions
//       not sure if its viem or failed RPC requests or what, but the promises get stuck/never resolve

// TODO: use IndexedDB cache for these?

type CacheKey = `${number}:${Hex}`;
const cache: Record<CacheKey, Promise<TransactionReceipt>> = {};

export const getTransactionReceipt = (publicClient: PublicClient & { chain: Chain }, hash: Hex) => {
  const key: CacheKey = `${publicClient.chain.id}:${hash}`;
  if (!cache[key]) {
    cache[key] = publicClient.waitForTransactionReceipt({ hash });
  }
  return cache[key];
};
