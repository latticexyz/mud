import { Client, Transport, Chain, Account, Hex, Address } from "viem";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { getWorldFactoryContracts } from "./getWorldFactoryContracts";
import { getWorldProxyFactoryContracts } from "./getWorldProxyFactoryContracts";

export async function ensureWorldFactory(
  client: Client<Transport, Chain | undefined, Account>,
  deployerAddress: Hex,
  withWorldProxy?: boolean,
): Promise<Address> {
  if (!withWorldProxy) {
    const contracts = getWorldFactoryContracts(deployerAddress);

    // WorldFactory constructor doesn't call InitModule, only sets its address, so we can do these in parallel since the address is deterministic
    await ensureContractsDeployed({
      client,
      deployerAddress,
      contracts: Object.values(contracts),
    });

    return contracts.WorldFactory.address;
  } else {
    const contracts = getWorldProxyFactoryContracts(deployerAddress);

    // WorldFactory constructor doesn't call InitModule, only sets its address, so we can do these in parallel since the address is deterministic
    await ensureContractsDeployed({
      client,
      deployerAddress,
      contracts: Object.values(contracts),
    });

    return contracts.WorldProxyFactory.address;
  }
}
