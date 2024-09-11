import { Account, Address, Chain, Client, Hex, Transport, stringToHex } from "viem";
import { ensureDeployer } from "./ensureDeployer";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import { Library, Module, System, WorldDeploy, supportedStoreVersions, supportedWorldVersions } from "./common";
import { ensureSystems } from "./ensureSystems";
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
import { waitForTransactions } from "./waitForTransactions";
import { ContractArtifact } from "@latticexyz/world/node";
import { World } from "@latticexyz/world";
import { deployCustomWorld } from "./deployCustomWorld";

type DeployOptions = {
  config: World;
  client: Client<Transport, Chain | undefined, Account>;
  tables: readonly Table[];
  systems: readonly System[];
  libraries: readonly Library[];
  modules?: readonly Module[];
  artifacts: readonly ContractArtifact[];
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
  config,
  client,
  tables,
  systems,
  libraries,
  modules = [],
  artifacts,
  salt,
  worldAddress: existingWorldAddress,
  deployerAddress: initialDeployerAddress,
}: DeployOptions): Promise<WorldDeploy> {
  const deployerAddress = initialDeployerAddress ?? (await ensureDeployer(client));

  await ensureWorldFactory(client, deployerAddress, config.deploy.upgradeableWorldImplementation);

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
    : config.deploy.customWorld
      ? await deployCustomWorld({
          client,
          deployerAddress,
          artifacts,
          customWorld: config.deploy.customWorld,
        })
      : await deployWorld(
          client,
          deployerAddress,
          salt ?? `0x${randomBytes(32).toString("hex")}`,
          config.deploy.upgradeableWorldImplementation,
        );

  if (!supportedStoreVersions.includes(worldDeploy.storeVersion)) {
    throw new Error(`Unsupported Store version: ${worldDeploy.storeVersion}`);
  }
  if (!supportedWorldVersions.includes(worldDeploy.worldVersion)) {
    throw new Error(`Unsupported World version: ${worldDeploy.worldVersion}`);
  }

  const namespaceTxs = await ensureNamespaceOwner({
    client,
    worldDeploy,
    resourceIds: [...tables.map(({ tableId }) => tableId), ...systems.map(({ systemId }) => systemId)],
  });
  // Wait for namespaces to be available, otherwise referencing them below may fail.
  // This is only here because OPStack chains don't let us estimate gas with pending block tag.
  await waitForTransactions({ client, hashes: namespaceTxs, debugLabel: "namespace registrations" });

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
  // Wait for tables and systems to be available, otherwise referencing their resource IDs below may fail.
  // This is only here because OPStack chains don't let us estimate gas with pending block tag.
  await waitForTransactions({
    client,
    hashes: [...tableTxs, ...systemTxs],
    debugLabel: "table and system registrations",
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

  const tableTags = tables.map(({ tableId: resourceId, label }) => ({ resourceId, tag: "label", value: label }));
  const systemTags = systems.flatMap(({ systemId: resourceId, label, abi, worldAbi }) => [
    { resourceId, tag: "label", value: label },
    { resourceId, tag: "abi", value: abi.join("\n") },
    { resourceId, tag: "worldAbi", value: worldAbi.join("\n") },
  ]);

  const tagTxs = await ensureResourceTags({
    client,
    deployerAddress,
    libraries,
    worldDeploy,
    tags: [...tableTags, ...systemTags],
    valueToHex: stringToHex,
  });

  await waitForTransactions({
    client,
    hashes: [...functionTxs, ...moduleTxs, ...tagTxs],
    debugLabel: "remaining transactions",
  });

  debug("deploy complete");
  return worldDeploy;
}
