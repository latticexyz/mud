import { Hex, SimulateContractReturnType, PublicClient, Chain, decodeFunctionData } from "viem";
import { getTransaction } from "./getTransaction";
import { getTransactionReceipt } from "./getTransactionReceipt";
import { useStore } from "../useStore";

// TODO: something about this fails when doing lots of simultaneous requests for transactions
//       not sure if its viem or failed RPC requests or what, but the promises get stuck/never resolve

// TODO: use IndexedDB cache for these?

type CacheKey = `${number}:${Hex}`;
const cache: Record<CacheKey, Promise<SimulateContractReturnType>> = {};

export const getTransactionResult = (publicClient: PublicClient & { chain: Chain }, hash: Hex) => {
  const key: CacheKey = `${publicClient.chain.id}:${hash}`;
  if (!cache[key]) {
    const { worldAbi } = useStore.getState();
    const transaction = getTransaction(publicClient, hash);
    const transactionReceipt = getTransactionReceipt(publicClient, hash);
    cache[key] = Promise.all([transaction, transactionReceipt]).then(([tx, receipt]) => {
      const { functionName, args } = decodeFunctionData({ abi: worldAbi, data: tx.input });
      return publicClient.simulateContract({
        account: tx.from,
        address: tx.to!,
        abi: worldAbi,
        functionName,
        args,
        // value: tx.value,
        blockNumber: receipt.blockNumber,
        // TODO: do we need to include nonce, gas price, etc. to properly simulate?
      });
    });
  }
  return cache[key];
};
