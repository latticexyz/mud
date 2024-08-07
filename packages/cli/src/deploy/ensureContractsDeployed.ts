import { Client, Transport, Chain, Account, Hex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { debug } from "./debug";
import { Contract, ensureContract } from "./ensureContract";
import { uniqueBy } from "@latticexyz/common/utils";

export async function ensureContractsDeployed({
  client,
  deployerAddress,
  contracts,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex;
  readonly contracts: readonly Contract[];
}): Promise<readonly Hex[]> {
  // Deployments assume a deterministic deployer, so we only need to deploy the unique bytecode
  const uniqueContracts = uniqueBy(contracts, (contract) => contract.bytecode);

  const txs = (
    await Promise.all(uniqueContracts.map((contract) => ensureContract({ client, deployerAddress, ...contract })))
  ).flat();

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
