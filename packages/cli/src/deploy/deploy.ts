import { Account, Address, Chain, Client, Hex, Transport, stringToHex } from "viem";
import { ensureDeployer } from "./ensureDeployer";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import { Library, Module, System, WorldDeploy, supportedStoreVersions, supportedWorldVersions } from "./common";
import { ensureSystems } from "./ensureSystems";
import { waitForTransactionReceipt } from "viem/actions";
import { getWorldDeploy } from "./getWorldDeploy";
import { ensureFunctions } from "./ensureFunctions";
import { ensureModules } from "./ensureModules";
import { ensureNamespaceOwner } from "./ensureNamespaceOwner";
import { debug } from "./debug";
import { resourceToLabel } from "@latticexyz/common";
import { ensureContractsDeployed } from "./ensureContractsDeployed";
import { randomBytes } from "crypto";
import { ensureWorldFactory } from "./ensureWorldFactory";
import { Table } from "@latticexyz/config";
import { ensureResourceTags } from "./ensureResourceTags";

type DeployOptions = {
  client: Client<Transport, Chain | undefined, Account>;
  tables: readonly Table[];
  systems: readonly System[];
  libraries: readonly Library[];
  modules?: readonly Module[];
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
export async function deploy({
  client,
  tables,
  systems,
  libraries,
  modules = [],
  salt,
  worldAddress: existingWorldAddress,
  deployerAddress: initialDeployerAddress,
  withWorldProxy,
}: DeployOptions): Promise<WorldDeploy> {
  const deployerAddress = initialDeployerAddress ?? (await ensureDeployer(client));

  await ensureWorldFactory(client, deployerAddress, withWorldProxy);

  // deploy all dependent contracts, because system registration, module install, etc. all expect these contracts to be callable.
  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: [
      ...libraries.map((library) => ({
        bytecode: library.prepareDeploy(deployerAddress, libraries).bytecode,
        deployedBytecodeSize: library.deployedBytecodeSize,
        debugLabel: `${library.path}:${library.name} library`,
      })),
      ...systems.map((system) => ({
        bytecode: system.prepareDeploy(deployerAddress, libraries).bytecode,
        deployedBytecodeSize: system.deployedBytecodeSize,
        debugLabel: `${resourceToLabel(system)} system`,
      })),
      ...modules.map((mod) => ({
        bytecode: mod.prepareDeploy(deployerAddress, libraries).bytecode,
        deployedBytecodeSize: mod.deployedBytecodeSize,
        debugLabel: `${mod.name} module`,
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

  const resources = [
    ...tables.map((table) => ({ resourceId: table.tableId, label: table.label })),
    ...systems.map((system) => ({ resourceId: system.systemId, label: system.label })),
  ];
  const namespaceTxs = await ensureNamespaceOwner({
    client,
    worldDeploy,
    resourceIds: resources.map(({ resourceId }) => resourceId),
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
    libraries,
    worldDeploy,
    systems,
  });
  const functionTxs = await ensureFunctions({
    client,
    worldDeploy,
    functions: systems.flatMap((system) => system.worldFunctions),
  });
  const moduleTxs = await ensureModules({
    client,
    deployerAddress,
    libraries,
    worldDeploy,
    modules,
  });

  const labelTxs = await ensureResourceTags({
    client,
    worldDeploy,
    tags: resources.map((resource) => ({
      resourceId: resource.resourceId,
      tag: "label",
      value: resource.label,
    })),
    valueToHex: stringToHex,
  });

  const txs = [...tableTxs, ...systemTxs, ...functionTxs, ...moduleTxs, ...labelTxs];

  // wait for each tx separately/serially, because parallelizing results in RPC errors
  debug("waiting for all transactions to confirm");
  for (const tx of txs) {
    await waitForTransactionReceipt(client, { hash: tx });
    // TODO: throw if there was a revert?
  }

  debug("deploy complete");
  return worldDeploy;
}
