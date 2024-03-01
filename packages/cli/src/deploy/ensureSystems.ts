import { Client, Transport, Chain, Account, Hex, getAddress, Address } from "viem";
import { writeContract, resourceToLabel } from "@latticexyz/common";
import { System, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { getSystems } from "./getSystems";
import { getResourceAccess } from "./getResourceAccess";
import { uniqueBy, wait } from "@latticexyz/common/utils";
import pRetry from "p-retry";
import { ensureContractsDeployed } from "./ensureContractsDeployed";

// TODO: move each system registration+access to batch call to be atomic

export async function ensureSystems({
  client,
  deployerAddress,
  worldDeploy,
  systems,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly deployerAddress: Hex; // TODO: move this into WorldDeploy to reuse a world's deployer?
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
        getAddress(worldSystem.address) === getAddress(system.getAddress(deployerAddress)),
    ),
  );
  if (existingSystems.length) {
    debug("existing systems", existingSystems.map(resourceToLabel).join(", "));
  }
  const existingSystemIds = existingSystems.map((system) => system.systemId);

  const missingSystems = systems.filter((system) => !existingSystemIds.includes(system.systemId));
  if (!missingSystems.length) return [];

  const systemsToUpgrade = missingSystems.filter((system) =>
    worldSystems.some(
      (worldSystem) =>
        worldSystem.systemId === system.systemId &&
        getAddress(worldSystem.address) !== getAddress(system.getAddress(deployerAddress)),
    ),
  );
  if (systemsToUpgrade.length) {
    debug("upgrading systems", systemsToUpgrade.map(resourceToLabel).join(", "));
  }

  const systemsToAdd = missingSystems.filter(
    (system) => !worldSystems.some((worldSystem) => worldSystem.systemId === system.systemId),
  );
  if (systemsToAdd.length) {
    debug("registering new systems", systemsToAdd.map(resourceToLabel).join(", "));
  }

  await ensureContractsDeployed({
    client,
    deployerAddress,
    contracts: uniqueBy(missingSystems, (system) => getAddress(system.getAddress(deployerAddress))).map((system) => ({
      bytecode: system.bytecode,
      deployedBytecodeSize: system.deployedBytecodeSize,
      label: `${resourceToLabel(system)} system`,
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
            args: [system.systemId, system.getAddress(deployerAddress), system.allowAll],
          }),
        {
          retries: 3,
          onFailedAttempt: async (error) => {
            const delay = error.attemptNumber * 500;
            debug(`failed to register system ${resourceToLabel(system)}, retrying in ${delay}ms...`);
            await wait(delay);
          },
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
            systems.find((s) => s.systemId === systemId)?.getAddress(deployerAddress),
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
          onFailedAttempt: async (error) => {
            const delay = error.attemptNumber * 500;
            debug(`failed to revoke access, retrying in ${delay}ms...`);
            await wait(delay);
          },
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
          onFailedAttempt: async (error) => {
            const delay = error.attemptNumber * 500;
            debug(`failed to grant access, retrying in ${delay}ms...`);
            await wait(delay);
          },
        },
      ),
    ),
  ]);

  return [...registerTxs, ...accessTxs];
}
