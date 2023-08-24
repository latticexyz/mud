import { ContractWrite } from "@latticexyz/common";
import { TransactionReceipt, PublicClient, Chain, Transport } from "viem";

// TODO: use IndexedDB cache for these?

const cache: Record<string, Promise<TransactionReceipt>> = {};

export function getTransactionReceipt(
  publicClient: PublicClient<Transport, Chain>,
  write: ContractWrite
): Promise<TransactionReceipt> {
  if (!cache[write.id]) {
    cache[write.id] = write.result.then((hash) => publicClient.waitForTransactionReceipt({ hash }));
  }
  return cache[write.id];
}
