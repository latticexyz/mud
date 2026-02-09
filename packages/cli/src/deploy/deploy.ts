import { Address, Hex, stringToHex } from "viem";
import { deployWorld } from "./deployWorld";
import { ensureTables } from "./ensureTables";
import {
  CommonDeployOptions,
  Library,
  Module,
  System,
  WorldDeploy,
  supportedStoreVersions,
  supportedWorldVersions,
} from "./common";
import { ensureSystems } from "./ensureSystems";
import { getWorldDeploy } from "./getWorldDeploy";
import { ensureFunctions } from "./ensureFunctions";
import { ensureModules } from "./ensureModules";
import { ensureNamespaceOwner } from "./ensureNamespaceOwner";
import { debug } from "./debug";
import { resourceToHex, resourceToLabel } from "@latticexyz/common";
import { randomBytes } from "crypto";
import { Table } from "@latticexyz/config";
import { ensureResourceTags } from "./ensureResourceTags";
import { ContractArtifact } from "@latticexyz/world/node";
import { World } from "@latticexyz/world";
import { deployCustomWorld } from "./deployCustomWorld";
import { uniqueBy } from "@latticexyz/common/utils";
import { getLibraryMap } from "./getLibraryMap";
import { ensureContractsDeployed, ensureDeployer, waitForTransactions } from "@latticexyz/common/internal";

type DeployOptions = {
  config: World;
  tables: readonly Table[];
  systems: readonly System[];
  libraries: readonly Library[];
  modules?: readonly Module[];
  artifacts: readonly ContractArtifact[];
  salt?: Hex;
  worldAddress?: Address;
  /**
   * Block number of an existing world deployment.
   * Only used if `worldAddress` is provided.
   */
  worldDeployBlock?: bigint;
  /**
   * Address of determinstic deployment proxy: https://github.com/Arachnid/deterministic-deployment-proxy
   * By default, we look for a deployment at 0x4e59b44847b379578588920ca78fbf26c0b4956c and, if not, deploy one.
   * If the target chain does not support legacy transactions, we deploy the proxy bytecode anyway, but it will
   * not have a deterministic address.
   */
  deployerAddress?: Hex;
  withWorldProxy?: boolean;
} & Omit<CommonDeployOptions, "worldDeploy">;

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
  worldDeployBlock,
  deployerAddress: initialDeployerAddress,
  indexerUrl,
  chainId,
}: DeployOptions): Promise<
  WorldDeploy & {
    /** Addresses of the deployed contracts */
    readonly contracts: readonly {
      readonly label: string;
      readonly address: Address;
    }[];
  }
> {
  const deployerAddress = initialDeployerAddress ?? (await ensureDeployer(client));

  const worldDeploy = existingWorldAddress
    ? await getWorldDeploy(client, existingWorldAddress, worldDeployBlock)
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

  const commonDeployOptions = {
    client,
    indexerUrl,
    chainId,
    worldDeploy,
  } satisfies CommonDeployOptions;

  if (!supportedStoreVersions.includes(worldDeploy.storeVersion)) {
    throw new Error(`Unsupported Store version: ${worldDeploy.storeVersion}`);
  }
  if (!supportedWorldVersions.includes(worldDeploy.worldVersion)) {
    throw new Error(`Unsupported World version: ${worldDeploy.worldVersion}`);
  }

  const libraryMap = getLibraryMap(libraries);
  const deployedContracts = await ensureContractsDeployed({
    ...commonDeployOptions,
    deployerAddress,
    contracts: [
      ...libraries.map((library) => ({
        bytecode: library.prepareDeploy(deployerAddress, libraryMap).bytecode,
        deployedBytecodeSize: library.deployedBytecodeSize,
        debugLabel: `${library.path}:${library.name} library`,
      })),
      ...systems.map((system) => ({
        bytecode: system.prepareDeploy(deployerAddress, libraryMap).bytecode,
        deployedBytecodeSize: system.deployedBytecodeSize,
        debugLabel: `${resourceToLabel(system)} system`,
      })),
      ...modules.map((mod) => ({
        bytecode: mod.prepareDeploy(deployerAddress, libraryMap).bytecode,
        deployedBytecodeSize: mod.deployedBytecodeSize,
        debugLabel: `${mod.name} module`,
      })),
    ],
  });

  const namespaceTxs = await ensureNamespaceOwner({
    ...commonDeployOptions,
    resourceIds: [...tables.map(({ tableId }) => tableId), ...systems.map(({ systemId }) => systemId)],
  });
  // Wait for namespaces to be available, otherwise referencing them below may fail.
  // This is only here because OPStack chains don't let us estimate gas with pending block tag.
  await waitForTransactions({ client, hashes: namespaceTxs, debugLabel: "namespace registrations" });

  const tableTxs = await ensureTables({
    ...commonDeployOptions,
    tables,
  });
  const systemTxs = await ensureSystems({
    ...commonDeployOptions,
    deployerAddress,
    libraryMap,
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
    ...commonDeployOptions,
    functions: systems.flatMap((system) => system.worldFunctions),
  });
  const moduleTxs = await ensureModules({
    ...commonDeployOptions,
    deployerAddress,
    libraryMap,
    modules,
  });

  const namespaceTags = uniqueBy(
    [...tables, ...systems]
      // only register labels if they differ from the resource ID
      .filter(({ namespace, namespaceLabel }) => namespaceLabel !== namespace)
      .map(({ namespace, namespaceLabel }) => ({
        resourceId: resourceToHex({ type: "namespace", namespace, name: "" }),
        tag: "label",
        value: namespaceLabel,
      })),
    (tag) => tag.resourceId,
  );

  const tableTags = tables
    // only register labels if they differ from the resource ID
    .filter((table) => table.label !== table.name)
    .map(({ tableId: resourceId, label }) => ({ resourceId, tag: "label", value: label }));

  const systemTags = systems.flatMap(({ name, systemId: resourceId, label, metadata }) => [
    // only register labels if they differ from the resource ID
    ...(label !== name ? [{ resourceId, tag: "label", value: label }] : []),
    { resourceId, tag: "abi", value: metadata.abi.join("\n") },
    { resourceId, tag: "worldAbi", value: metadata.worldAbi.join("\n") },
  ]);

  const tagTxs = await ensureResourceTags({
    ...commonDeployOptions,
    deployerAddress,
    libraryMap,
    tags: [...namespaceTags, ...tableTags, ...systemTags],
    valueToHex: stringToHex,
  });

  await waitForTransactions({
    client,
    hashes: [...functionTxs, ...moduleTxs, ...tagTxs],
    debugLabel: "remaining transactions",
  });

  debug("deploy complete");
  return {
    ...worldDeploy,
    contracts: deployedContracts.map(({ contract, deployedAddress }) => ({
      label: contract.debugLabel ?? "unknown",
      address: deployedAddress,
    })),
  };
}
