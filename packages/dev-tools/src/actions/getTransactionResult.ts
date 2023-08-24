import { SimulateContractReturnType, PublicClient, Chain, decodeFunctionData, Transport, Abi } from "viem";
import { getTransaction } from "./getTransaction";
import { getTransactionReceipt } from "./getTransactionReceipt";
import { ContractWrite } from "@latticexyz/common";

// TODO: something about this fails when doing lots of simultaneous requests for transactions
//       not sure if its viem or failed RPC requests or what, but the promises get stuck/never resolve

// TODO: use IndexedDB cache for these?

const cache: Record<string, Promise<SimulateContractReturnType>> = {};

export function getTransactionResult(
  publicClient: PublicClient<Transport, Chain>,
  worldAbi: Abi,
  write: ContractWrite
): Promise<SimulateContractReturnType> {
  if (!cache[write.id]) {
    const transaction = getTransaction(publicClient, write);
    const transactionReceipt = getTransactionReceipt(publicClient, write);
    cache[write.id] = Promise.all([transaction, transactionReceipt]).then(([tx, receipt]) => {
      const { functionName, args } = decodeFunctionData({ abi: worldAbi, data: tx.input });
      return publicClient.simulateContract({
        account: tx.from,
        address: tx.to!,
        abi: worldAbi,
        functionName,
        args,
        // simulation happens at the end of the block, so we need to use the previous block number
        blockNumber: receipt.blockNumber - 1n,
        // TODO: do we need to include value, nonce, gas price, etc. to properly simulate?
      });
    });
  }
  return cache[write.id];
}
