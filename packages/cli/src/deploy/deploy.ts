import { Account, Address, Chain, Client, Transport } from "viem";
import { ensureDeployer } from "./ensureDeployer";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import {
  Config,
  ConfigInput,
  DeterministicContract,
  WorldDeploy,
  supportedStoreVersions,
  supportedWorldVersions,
} from "./common";
import { ensureSystems } from "./ensureSystems";
import { waitForTransactionReceipt } from "viem/actions";
import { getWorldDeploy } from "./getWorldDeploy";
import { ensureFunctions } from "./ensureFunctions";
import { ensureModules } from "./ensureModules";
import { Table } from "./configToTables";
import { assertNamespaceOwner } from "./assertNamespaceOwner";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { ensureContract } from "./ensureContract";
import { uniqueBy } from "@latticexyz/common/utils";

type DeployOptions<configInput extends ConfigInput> = {
  client: Client<Transport, Chain | undefined, Account>;
  config: Config<configInput>;
  worldAddress?: Address;
};

/**
 * Given a viem client and MUD config, we attempt to introspect the world
 * (or deploy a new one if no world address is provided) and do the minimal
 * amount of work to make the world match the config (e.g. deploy new tables,
 * replace systems, etc.)
 */
export async function deploy<configInput extends ConfigInput>({
  client,
  config,
  worldAddress: existingWorldAddress,
}: DeployOptions<configInput>): Promise<WorldDeploy> {
  await ensureDeployer(client);

  const worldDeploy = existingWorldAddress
    ? await getWorldDeploy(client, existingWorldAddress)
    : await deployWorld(client);

  if (!supportedStoreVersions.includes(worldDeploy.storeVersion)) {
    throw new Error(`Unsupported Store version: ${worldDeploy.storeVersion}`);
  }
  if (!supportedWorldVersions.includes(worldDeploy.worldVersion)) {
    throw new Error(`Unsupported World version: ${worldDeploy.worldVersion}`);
  }

  const tables = Object.values(config.tables) as Table[];
  const systems = Object.values(config.systems);

  await assertNamespaceOwner({
    client,
    worldDeploy,
    resourceIds: [...tables.map((table) => table.tableId), ...systems.map((system) => system.systemId)],
  });

  // deploy all dependent contracts, because system registration, module install, etc. all expect these contracts to be callable.
  const contractTxs = (
    await Promise.all([
      ...uniqueBy(systems, (system) => system.address).map((system) =>
        ensureContract({ client, bytecode: system.bytecode, label: `${resourceLabel(system)} system` })
      ),
      ...uniqueBy(config.modules, (mod) => mod.address).map((mod) =>
        ensureContract({ client, bytecode: mod.bytecode, label: `${mod.name} module` })
      ),
    ])
  ).flat();

  if (contractTxs.length) {
    debug("waiting for contracts");
    // wait for each tx separately/serially, because parallelizing results in RPC errors
    for (const tx of contractTxs) {
      await waitForTransactionReceipt(client, { hash: tx });
      // TODO: throw if there was a revert?
    }
  }

  const tableTxs = await ensureTables({
    client,
    worldDeploy,
    tables,
  });
  const systemTxs = await ensureSystems({
    client,
    worldDeploy,
    systems,
  });
  const functionTxs = await ensureFunctions({
    client,
    worldDeploy,
    functions: systems.flatMap((system) => system.functions),
  });
  const moduleTxs = await ensureModules({
    client,
    worldDeploy,
    modules: config.modules,
  });

  const txs = [...tableTxs, ...systemTxs, ...functionTxs, ...moduleTxs];

  // wait for each tx separately/serially, because parallelizing results in RPC errors
  debug("waiting for all transactions to confirm");
  for (const tx of txs) {
    await waitForTransactionReceipt(client, { hash: tx });
    // TODO: throw if there was a revert?
  }

  debug("deploy complete");
  return worldDeploy;
}
