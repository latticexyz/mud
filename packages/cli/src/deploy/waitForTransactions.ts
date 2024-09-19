import { Client, Transport, Chain, Account, Hex, TransactionReceipt } from "viem";
import { debug } from "./debug";
import { waitForTransactionReceipt } from "viem/actions";

export async function waitForTransactions({
  client,
  hashes,
  debugLabel = "transactions",
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly hashes: readonly Hex[];
  readonly debugLabel: string;
}): Promise<TransactionReceipt[]> {
  if (!hashes.length) return [];

  debug(`waiting for ${debugLabel} to confirm`);
  const receipts: TransactionReceipt[] = [];
  // wait for each tx separately/serially, because parallelizing results in RPC errors
  for (const hash of hashes) {
    const receipt = await waitForTransactionReceipt(client, {
      hash,
      pollingInterval: 100,
      retryCount: 8,
      retryDelay: ({ count }) => {
        console.log("retry", count);
        return ~~(1 << count) * 400;
      },
    });
    if (receipt.status === "reverted") {
      throw new Error(`Transaction reverted: ${hash}`);
    }
    receipts.push(receipt);
  }

  return receipts;
}
