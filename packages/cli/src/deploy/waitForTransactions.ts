import { Client, Transport, Chain, Account, Hex } from "viem";
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
}): Promise<void> {
  if (!hashes.length) return;

  debug(`waiting for ${debugLabel} to confirm`);
  // wait for each tx separately/serially, because parallelizing results in RPC errors
  for (const hash of hashes) {
    const receipt = await waitForTransactionReceipt(client, { hash });
    if (receipt.status === "reverted") {
      throw new Error(`Transaction reverted: ${hash}`);
    }
  }
}
