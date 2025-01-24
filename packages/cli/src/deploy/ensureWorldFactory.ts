import { Client, Transport, Chain, Account, Hex, Address } from "viem";
import { getWorldFactoryContracts } from "./getWorldFactoryContracts";
import { getWorldProxyFactoryContracts } from "./getWorldProxyFactoryContracts";
import { ensureContractsDeployed } from "@latticexyz/common/internal";

export async function ensureWorldFactory(
  client: Client<Transport, Chain | undefined, Account>,
  deployerAddress: Hex,
  withWorldProxy?: boolean,
): Promise<Address> {
  if (withWorldProxy) {
    const contracts = getWorldProxyFactoryContracts(deployerAddress);
    // We can deploy these contracts in parallel because they do not call each other at this point.
    await ensureContractsDeployed({
      client,
      deployerAddress,
      contracts: Object.values(contracts),
    });
    return contracts.WorldProxyFactory.address;
  }

  const contracts = getWorldFactoryContracts(deployerAddress);
  // We can deploy these contracts in parallel because they do not call each other at this point.
  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: Object.values(contracts),
  });
  return contracts.WorldFactory.address;
}
