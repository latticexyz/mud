import { Account, Address, Chain, Client, Transport } from "viem";
import { ensureDeployer } from "./deployer";
import { deployWorld } from "./deployWorld";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";
import { configToTables } from "./configToTables";
import { ensureTables } from "./ensureTables";

type DeployOptions = {
  client: Client<Transport, Chain | undefined, Account>;
  config: StoreConfig & WorldConfig;
  worldAddress?: Address;
};

export async function deploy({ client, config, worldAddress: existingWorldAddress }: DeployOptions): Promise<void> {
  await ensureDeployer(client);

  const worldAddress = existingWorldAddress ?? (await deployWorld(client));
  console.log("got world address", worldAddress);

  // TODO: detect world/store versions and throw if incompatible

  const tables = configToTables(config);

  const tableTxs = await ensureTables({ client, worldAddress, tables: Object.values(tables) });
}
