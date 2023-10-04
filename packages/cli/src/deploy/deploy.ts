import { Account, Address, Chain, Client, Transport } from "viem";
import { ensureDeployer } from "./deployer";
import { deployWorld } from "./deployWorld";

type DeployOptions = {
  client: Client<Transport, Chain | undefined, Account>;
  worldAddress?: Address;
};

export async function deploy({ client, worldAddress: existingWorldAddress }: DeployOptions): Promise<void> {
  await ensureDeployer(client);

  const worldAddress = existingWorldAddress ?? (await deployWorld(client));
  console.log("got world address", worldAddress);
}
