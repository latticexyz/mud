import { Client, Transport, Chain, Account, Hex, getAddress, Address } from "viem";
import { writeContract, resourceToLabel } from "@latticexyz/common";
import { Library, System, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { getSystems } from "./getSystems";
import { getResourceAccess } from "./getResourceAccess";
import pRetry from "p-retry";
import { ensureContractsDeployed } from "./ensureContractsDeployed";

// TODO: move each system registration+access to batch call to be atomic

export async function ensureSystems({
  client,
  deployerAddress,
  libraries,
  worldDeploy,
  systems,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex;
  readonly libraries: readonly Library[];
  readonly worldDeploy: WorldDeploy;
  readonly systems: readonly System[];
}): Promise<readonly Hex[]> {
  const [worldSystems, worldAccess] = await Promise.all([
    getSystems({ client, worldDeploy }),
    getResourceAccess({ client, worldDeploy }),
  ]);

  // Register or replace systems

  const existingSystems = systems.filter((system) =>
    worldSystems.some(
      (worldSystem) =>
        worldSystem.systemId === system.systemId &&
        getAddress(worldSystem.address) === getAddress(system.prepareDeploy(deployerAddress, libraries).address),
    ),
  );
  if (existingSystems.length) {
    debug("existing systems:", existingSystems.map(resourceToLabel).join(", "));
  }
  const existingSystemIds = existingSystems.map((system) => system.systemId);

  const missingSystems = systems.filter((system) => !existingSystemIds.includes(system.systemId));
  if (!missingSystems.length) return [];

  const systemsToUpgrade = missingSystems.filter((system) =>
    worldSystems.some(
      (worldSystem) =>
        worldSystem.systemId === system.systemId &&
        getAddress(worldSystem.address) !== getAddress(system.prepareDeploy(deployerAddress, libraries).address),
    ),
  );
  if (systemsToUpgrade.length) {
    debug("upgrading systems:", systemsToUpgrade.map(resourceToLabel).join(", "));
  }

  const systemsToAdd = missingSystems.filter(
    (system) => !worldSystems.some((worldSystem) => worldSystem.systemId === system.systemId),
  );
  if (systemsToAdd.length) {
    debug("registering new systems:", systemsToAdd.map(resourceToLabel).join(", "));
  }

  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: missingSystems.map((system) => ({
      bytecode: system.prepareDeploy(deployerAddress, libraries).bytecode,
      deployedBytecodeSize: system.deployedBytecodeSize,
      debugLabel: `${resourceToLabel(system)} system`,
    })),
  });

  const registerTxs = await Promise.all(
    missingSystems.map((system) =>
      pRetry(
        () =>
          writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
            functionName: "registerSystem",
            args: [system.systemId, system.prepareDeploy(deployerAddress, libraries).address, system.allowAll],
          }),
        {
          retries: 3,
          onFailedAttempt: () => debug(`failed to register system ${resourceToLabel(system)}, retrying...`),
        },
      ),
    ),
  );

  // Adjust system access

  const systemIds = systems.map((system) => system.systemId);
  const currentAccess = worldAccess.filter(({ resourceId }) => systemIds.includes(resourceId));
  const desiredAccess = [
    ...systems.flatMap((system) =>
      system.allowedAddresses.map((address) => ({ resourceId: system.systemId, address })),
    ),
    ...systems.flatMap((system) =>
      system.allowedSystemIds
        .map((systemId) => ({
          resourceId: system.systemId,
          address:
            worldSystems.find((s) => s.systemId === systemId)?.address ??
            systems.find((s) => s.systemId === systemId)?.prepareDeploy(deployerAddress, libraries).address,
        }))
        .filter((access): access is typeof access & { address: Address } => access.address != null),
    ),
  ];

  const accessToAdd = desiredAccess.filter(
    (access) =>
      !currentAccess.some(
        ({ resourceId, address }) =>
          resourceId === access.resourceId && getAddress(address) === getAddress(access.address),
      ),
  );

  const accessToRemove = currentAccess.filter(
    (access) =>
      !desiredAccess.some(
        ({ resourceId, address }) =>
          resourceId === access.resourceId && getAddress(address) === getAddress(access.address),
      ),
  );

  if (accessToRemove.length) {
    debug("revoking", accessToRemove.length, "access grants");
  }
  if (accessToAdd.length) {
    debug("adding", accessToAdd.length, "access grants");
  }

  const accessTxs = await Promise.all([
    ...accessToRemove.map((access) =>
      pRetry(
        () =>
          writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            functionName: "revokeAccess",
            args: [access.resourceId, access.address],
          }),
        {
          retries: 3,
          onFailedAttempt: () => debug("failed to revoke access, retrying..."),
        },
      ),
    ),
    ...accessToAdd.map((access) =>
      pRetry(
        () =>
          writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            functionName: "grantAccess",
            args: [access.resourceId, access.address],
          }),
        {
          retries: 3,
          onFailedAttempt: () => debug("failed to grant access, retrying..."),
        },
      ),
    ),
  ]);

  return [...registerTxs, ...accessTxs];
}
