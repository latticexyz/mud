import { Account, Address, Chain, Client, Transport } from "viem";
import { ensureDeployer } from "./ensureDeployer";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import { Config, ConfigInput } from "./common";
import { ensureSystems } from "./ensureSystems";
import { waitForTransactionReceipt } from "viem/actions";
import { getWorldDeploy } from "./getWorldDeploy";
import { ensureFunctions } from "./ensureFunctions";
import { ensureModules } from "./ensureModules";

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

  // TODO: check if there are any namespaces we don't have access to before attempting to register things on them
  // TODO: check for and register namespaces? these are registered by default when registering tables/systems through the world

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
  const moduleTxs = await ensureModules({
    client,
    worldDeploy,
    modules: config.modules,
  });

  const receipts = await Promise.all(
    [...tableTxs, ...systemTxs, ...functionTxs, ...moduleTxs].map((tx) =>
      waitForTransactionReceipt(client, { hash: tx })
    )
  );
}
