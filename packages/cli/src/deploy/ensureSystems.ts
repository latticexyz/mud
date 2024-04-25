import { Client, Transport, Chain, Account, Hex, getAddress } from "viem";
import { writeContract } from "@latticexyz/common";
import { System, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getSystems } from "./getSystems";
import { getResourceAccess } from "./getResourceAccess";
import { uniqueBy, wait } from "@latticexyz/common/utils";
import pRetry from "p-retry";
import { ensureContractsDeployed } from "./ensureContractsDeployed";

export async function ensureSystems({
  client,
  worldDeploy,
  systems,
}: {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly systems: readonly System[];
}): Promise<readonly Hex[]> {
  const [worldSystems, worldAccess] = await Promise.all([
    getSystems({ client, worldDeploy }),
    getResourceAccess({ client, worldDeploy }),
  ]);
  const systemIds = systems.map((system) => system.systemId);
  const currentAccess = worldAccess.filter(({ resourceId }) => systemIds.includes(resourceId));
  const desiredAccess = systems.flatMap((system) =>
    system.allowedAddresses.map((address) => ({ resourceId: system.systemId, address }))
  );

  const accessToAdd = desiredAccess.filter(
    (access) =>
      !currentAccess.some(
        ({ resourceId, address }) =>
          resourceId === access.resourceId && getAddress(address) === getAddress(access.address)
      )
  );

  const accessToRemove = currentAccess.filter(
    (access) =>
      !desiredAccess.some(
        ({ resourceId, address }) =>
          resourceId === access.resourceId && getAddress(address) === getAddress(access.address)
      )
  );

  // TODO: move each system access+registration to batch call to be atomic

  if (accessToRemove.length) {
    debug("revoking", accessToRemove.length, "access grants");
  }
  if (accessToAdd.length) {
    debug("adding", accessToAdd.length, "access grants");
  }

  const accessTxs = [
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
        }
      )
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
        }
      )
    ),
  ];

  const existingSystems = systems.filter((system) =>
    worldSystems.some(
      (worldSystem) =>
        worldSystem.systemId === system.systemId && getAddress(worldSystem.address) === getAddress(system.address)
    )
  );
  if (existingSystems.length) {
    debug("existing systems", existingSystems.map(resourceLabel).join(", "));
  }
  const existingSystemIds = existingSystems.map((system) => system.systemId);

  const missingSystems = systems.filter((system) => !existingSystemIds.includes(system.systemId));
  if (!missingSystems.length) return [];

  const systemsToUpgrade = missingSystems.filter((system) =>
    worldSystems.some(
      (worldSystem) =>
        worldSystem.systemId === system.systemId && getAddress(worldSystem.address) !== getAddress(system.address)
    )
  );
  if (systemsToUpgrade.length) {
    debug("upgrading systems", systemsToUpgrade.map(resourceLabel).join(", "));
  }

  const systemsToAdd = missingSystems.filter(
    (system) => !worldSystems.some((worldSystem) => worldSystem.systemId === system.systemId)
  );
  if (systemsToAdd.length) {
    debug("registering new systems", systemsToAdd.map(resourceLabel).join(", "));
  }

  await ensureContractsDeployed({
    client,
    contracts: uniqueBy(missingSystems, (system) => getAddress(system.address)).map((system) => ({
      bytecode: system.bytecode,
      deployedBytecodeSize: system.deployedBytecodeSize,
      label: `${resourceLabel(system)} system`,
    })),
  });

  const registerTxs = missingSystems.map((system) =>
    pRetry(
      () =>
        writeContract(client, {
          chain: client.chain ?? null,
          address: worldDeploy.address,
          abi: worldAbi,
          // TODO: replace with batchCall (https://github.com/latticexyz/mud/issues/1645)
          functionName: "registerSystem",
          args: [system.systemId, system.address, system.allowAll],
        }),
      {
        retries: 3,
        onFailedAttempt: async (error) => {
          const delay = error.attemptNumber * 500;
          debug(`failed to register system ${resourceLabel(system)}, retrying in ${delay}ms...`);
          await wait(delay);
        },
      }
    )
  );

  return await Promise.all([...accessTxs, ...registerTxs]);
}
