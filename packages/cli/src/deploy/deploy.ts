import { Account, Address, Chain, Client, Hex, Transport } from "viem";
import { ensureDeployer } from "./ensureDeployer";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import { Config, ConfigInput, WorldDeploy, supportedStoreVersions, supportedWorldVersions } from "./common";
import { ensureSystems } from "./ensureSystems";
import { waitForTransactionReceipt } from "viem/actions";
import { getWorldDeploy } from "./getWorldDeploy";
import { ensureFunctions } from "./ensureFunctions";
import { ensureModules } from "./ensureModules";
import { Table } from "./configToTables";
import { ensureNamespaceOwner } from "./ensureNamespaceOwner";
import { debug } from "./debug";
import { resourceToLabel } from "@latticexyz/common";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { randomBytes } from "crypto";
import { ensureWorldFactory } from "./ensureWorldFactory";

type DeployOptions<configInput extends ConfigInput> = {
  client: Client<Transport, Chain | undefined, Account>;
  config: Config<configInput>;
  salt?: Hex;
  worldAddress?: Address;
  /**
   * Address of determinstic deployment proxy: https://github.com/Arachnid/deterministic-deployment-proxy
   * By default, we look for a deployment at 0x4e59b44847b379578588920ca78fbf26c0b4956c and, if not, deploy one.
   * If the target chain does not support legacy transactions, we deploy the proxy bytecode anyway, but it will
   * not have a deterministic address.
   */
  deployerAddress?: Hex;
  withWorldProxy?: boolean;
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
  salt,
  worldAddress: existingWorldAddress,
  deployerAddress: initialDeployerAddress,
  withWorldProxy,
}: DeployOptions<configInput>): Promise<WorldDeploy> {
  const tables = Object.values(config.tables) as Table[];

  const deployerAddress = initialDeployerAddress ?? (await ensureDeployer(client));

  await ensureWorldFactory(client, deployerAddress, withWorldProxy);

  // deploy all dependent contracts, because system registration, module install, etc. all expect these contracts to be callable.
  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: [
      ...config.libraries.map((library) => ({
        bytecode: library.prepareDeploy(deployerAddress, config.libraries).bytecode,
        deployedBytecodeSize: library.deployedBytecodeSize,
        label: `${library.path}:${library.name} library`,
      })),
      ...config.systems.map((system) => ({
        bytecode: system.prepareDeploy(deployerAddress, config.libraries).bytecode,
        deployedBytecodeSize: system.deployedBytecodeSize,
        label: `${resourceToLabel(system)} system`,
      })),
      ...config.modules.map((mod) => ({
        bytecode: mod.prepareDeploy(deployerAddress, config.libraries).bytecode,
        deployedBytecodeSize: mod.deployedBytecodeSize,
        label: `${mod.name} module`,
      })),
    ],
  });

  const worldDeploy = existingWorldAddress
    ? await getWorldDeploy(client, existingWorldAddress)
    : await deployWorld(client, deployerAddress, salt ?? `0x${randomBytes(32).toString("hex")}`, withWorldProxy);

  if (!supportedStoreVersions.includes(worldDeploy.storeVersion)) {
    throw new Error(`Unsupported Store version: ${worldDeploy.storeVersion}`);
  }
  if (!supportedWorldVersions.includes(worldDeploy.worldVersion)) {
    throw new Error(`Unsupported World version: ${worldDeploy.worldVersion}`);
  }

  const namespaceTxs = await ensureNamespaceOwner({
    client,
    worldDeploy,
    resourceIds: [...tables.map((table) => table.tableId), ...config.systems.map((system) => system.systemId)],
  });

  debug("waiting for all namespace registration transactions to confirm");
  for (const tx of namespaceTxs) {
    await waitForTransactionReceipt(client, { hash: tx });
  }

  const tableTxs = await ensureTables({
    client,
    worldDeploy,
    tables,
  });
  const systemTxs = await ensureSystems({
    client,
    deployerAddress,
    libraries: config.libraries,
    worldDeploy,
    systems: config.systems,
  });
  const functionTxs = await ensureFunctions({
    client,
    worldDeploy,
    functions: config.systems.flatMap((system) => system.functions),
  });
  const moduleTxs = await ensureModules({
    client,
    deployerAddress,
    libraries: config.libraries,
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
