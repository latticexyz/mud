import {
  Hex,
  TransactionReceipt,
  PublicClient,
  Chain,
  TransactionNotFoundError,
  TransactionReceiptNotFoundError,
} from "viem";

// TODO: use IndexedDB cache for these?

type CacheKey = `${number}:${Hex}`;
const cache: Record<CacheKey, Promise<TransactionReceipt>> = {};

export const getTransactionReceipt = (publicClient: PublicClient & { chain: Chain }, hash: Hex) => {
  const key: CacheKey = `${publicClient.chain.id}:${hash}`;

  if (!cache[key]) {
    // When kicking off multiple `waitForTransactionReceipt` calls at once, the latter promises never seem to resolve.
    // Instead, we'll do a very naive version of that here that doesn't handle replacements.
    // TODO: make a repro case for viem
    cache[key] = new Promise((resolve, reject) => {
      const unwatch = publicClient.watchBlockNumber({
        onBlockNumber: async (_blockNumber) => {
          try {
            const receipt = await publicClient.getTransactionReceipt({ hash });
            unwatch();
            resolve(receipt);
          } catch (error) {
            if (error instanceof TransactionNotFoundError || error instanceof TransactionReceiptNotFoundError) {
              // allow it to retry on the next block
              return;
            }
            unwatch();
            reject(error);
          }
        },
      });
    });
    // TODO: replace the above with this line once viem is fixed
    // cache[key] = publicClient.waitForTransactionReceipt({ hash });
    // TODO: figure out how to handle tx replacements: https://viem.sh/docs/actions/public/waitForTransactionReceipt.html#onreplaced-optional
  }
  return cache[key];
};
