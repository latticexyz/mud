import { Hex, Transaction, PublicClient, Chain, Transport } from "viem";

// TODO: something about this fails when doing lots of simultaneous requests for transactions
//       not sure if its viem or failed RPC requests or what, but the promises get stuck/never resolve

// TODO: use IndexedDB cache for these?

type CacheKey = `${number}:${Hex}`;
const cache: Record<CacheKey, Promise<Transaction>> = {};

export const getTransaction = (publicClient: PublicClient<Transport, Chain>, hash: Hex) => {
  const key: CacheKey = `${publicClient.chain.id}:${hash}`;
  if (!cache[key]) {
    cache[key] = publicClient.getTransaction({ hash });
  }
  return cache[key];
};
