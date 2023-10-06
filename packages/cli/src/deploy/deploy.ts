import { Account, Address, Chain, Client, Transport } from "viem";
import { ensureDeployer } from "./ensureDeployer";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import { Config, ConfigInput } from "./common";
import { ensureSystems } from "./ensureSystems";
import { waitForTransactionReceipt } from "viem/actions";
import { getResourceIds } from "./getResourceIds";
import { getWorldDeploy } from "./getWorldDeploy";
import { ensureFunctions } from "./ensureFunctions";

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

  const worldDeploy = existingWorldAddress
    ? await getWorldDeploy(client, existingWorldAddress)
    : await deployWorld(client);
  // TODO: check that world/store versions are compatible with our deploy

  // TODO: update RPC get calls to use `worldDeploy.toBlock` to align the block number everywhere

  const tableTxs = await ensureTables({
    client,
    worldDeploy,
    tables: Object.values(config.tables),
  });
  const systemTxs = await ensureSystems({
    client,
    worldDeploy,
    systems: Object.values(config.systems),
  });
  const functionTxs = await ensureFunctions({
    client,
    worldDeploy,
    functions: Object.values(config.systems).flatMap((system) => system.functions),
  });

  const receipts = await Promise.all(
    [...tableTxs, ...systemTxs, ...functionTxs].map((tx) => waitForTransactionReceipt(client, { hash: tx }))
  );
}
