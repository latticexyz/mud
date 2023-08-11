import { ContractWrite } from "@latticexyz/common";
import { Transaction, PublicClient, Chain, Transport } from "viem";

// TODO: something about this fails when doing lots of simultaneous requests for transactions
//       not sure if its viem or failed RPC requests or what, but the promises get stuck/never resolve

// TODO: use IndexedDB cache for these?

const cache: Record<string, Promise<Transaction>> = {};

export function getTransaction(
  publicClient: PublicClient<Transport, Chain>,
  write: ContractWrite
): Promise<Transaction> {
  if (!cache[write.id]) {
    cache[write.id] = write.result.then((hash) => publicClient.getTransaction({ hash }));
  }
  return cache[write.id];
}
