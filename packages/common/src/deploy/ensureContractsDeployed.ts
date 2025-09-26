import { Client, Transport, Chain, Account, Hex } from "viem";
import { Contract, ensureContract, EnsureContractResult } from "./ensureContract";
import { waitForTransactions } from "../waitForTransactions";
import { uniqueBy } from "../utils/uniqueBy";

export async function ensureContractsDeployed({
  client,
  deployerAddress,
  contracts,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex;
  readonly contracts: readonly Contract[];
}): Promise<EnsureContractResult[]> {
  // Deployments assume a deterministic deployer, so we only need to deploy the unique bytecode
  const uniqueContracts = uniqueBy(contracts, (contract) => contract.bytecode);

  const deployedContracts = (
    await Promise.all(uniqueContracts.map((contract) => ensureContract({ client, deployerAddress, ...contract })))
  ).flat();

  await waitForTransactions({
    client,
    hashes: deployedContracts.map(({ txHash }) => txHash).flat(),
    debugLabel: "contract deploys",
  });

  return deployedContracts;
}
