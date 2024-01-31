import { Client, Transport, Chain, Account, Hex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { debug } from "./debug";
import { Contract, ensureContract } from "./ensureContract";

export async function ensureContractsDeployed({
  client,
  contracts,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly contracts: readonly Contract[];
}): Promise<readonly Hex[]> {
  const txs = (await Promise.all(contracts.map((contract) => ensureContract({ client, ...contract })))).flat();

  if (txs.length) {
    debug("waiting for contracts");
    // wait for each tx separately/serially, because parallelizing results in RPC errors
    for (const tx of txs) {
      await waitForTransactionReceipt(client, { hash: tx });
      // TODO: throw if there was a revert?
    }
  }

  return txs;
}
