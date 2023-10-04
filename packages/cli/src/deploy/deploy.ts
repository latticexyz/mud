import { Account, Address, Chain, Client, Transport } from "viem";
import { ensureDeployer } from "./deployer";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import { Config, ConfigInput } from "./common";
import { ensureSystems } from "./ensureSystems";
import { waitForTransactionReceipt } from "viem/actions";

type DeployOptions<configInput extends ConfigInput> = {
  client: Client<Transport, Chain | undefined, Account>;
  config: Config<configInput>;
  worldAddress?: Address;
};

export async function deploy<configInput extends ConfigInput>({
  client,
  config,
  worldAddress: existingWorldAddress,
}: DeployOptions<configInput>): Promise<void> {
  await ensureDeployer(client);

  const worldAddress = existingWorldAddress ?? (await deployWorld(client));

  // TODO: detect world/store versions and throw if incompatible

  const tableTxs = await ensureTables({ client, worldAddress, tables: Object.values(config.tables) });
  const systemTxs = await ensureSystems({ client, worldAddress, systems: Object.values(config.systems) });

  const receipts = await Promise.all(
    [...tableTxs, ...systemTxs].map((tx) => waitForTransactionReceipt(client, { hash: tx }))
  );
  // console.log(config);
}
