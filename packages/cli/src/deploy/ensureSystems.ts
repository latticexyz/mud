import { Client, Transport, Chain, Account, Hex, getAddress, encodeFunctionData } from "viem";
import { writeContract } from "@latticexyz/common";
import { System, WorldDeploy, worldAbi } from "./common";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getSystems } from "./getSystems";
import { getResourceAccess } from "./getResourceAccess";
import { uniqueBy, wait } from "@latticexyz/common/utils";
import pRetry from "p-retry";
import { getBatchCallData } from "../utils/getBatchCallData";
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

  // Prepare access changes

  const systemIds = systems.map((system) => system.systemId);

  const currentAccess = worldAccess.filter(({ resourceId }) => systemIds.includes(resourceId));

  const desiredAccess = systems.flatMap((system) =>
    system.allowedAddresses.map((address) => ({ resourceId: system.systemId, address }))
  );

  type accessType = {
    resourceId: Hex;
    address: Hex;
    isRemove: boolean;
  };

  const accessToAdd: accessType[] = desiredAccess
    .filter(
      (access) =>
        !currentAccess.some(
          ({ resourceId, address }) =>
            resourceId === access.resourceId && getAddress(address) === getAddress(access.address)
        )
    )
    .map((access) => ({ ...access, isRemove: false }));

  const accessToRemove: accessType[] = currentAccess
    .filter(
      (access) =>
        !desiredAccess.some(
          ({ resourceId, address }) =>
            resourceId === access.resourceId && getAddress(address) === getAddress(access.address)
        )
    )
    .map((access) => ({ ...access, isRemove: true }));

  if (accessToRemove.length) {
    debug("revoking", accessToRemove.length, "access grants");
  }
  if (accessToAdd.length) {
    debug("adding", accessToAdd.length, "access grants");
  }

  const accessChanges = accessToAdd.concat(accessToRemove);

  const accessChangeMap = accessChanges.reduce((map, access) => {
    const systemId = access.resourceId;
    const accesses = map[systemId];
    if (accesses) {
      accesses.push(access);
    } else {
      map[systemId] = [access];
    }
    return map;
  }, {} as Record<string, accessType[]>);

  // Prepare Systems to register

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
      label: `${resourceLabel(system)} system`,
    })),
  });

  const missingSystemsMap = missingSystems.reduce((map, system) => {
    map[system.systemId] = system;
    return map;
  }, {} as Record<string, System>);

  if (Object.keys(missingSystemsMap).length !== missingSystems.length) {
    throw new Error("Duplicate systemId found in systems");
  }

  // Combine systems and access changes
  const registrationAndAccess: [System, accessType[]][] = Object.entries(missingSystemsMap).map(
    ([systemId, system]) => {
      if (systemId in accessChangeMap) {
        return [system, accessChangeMap[systemId]];
      } else {
        return [system, [] as accessType[]];
      }
    }
  );

  const encodedFunctionDataBySystem = registrationAndAccess.reduce((acc, [system, access]) => {
    const registerSystemFunctionData: Hex = encodeFunctionData({
      abi: worldAbi,
      functionName: "registerSystem",
      args: [system.systemId, system.address, system.allowAll],
    });

    const accessFunctionDataList: Hex[] = access.map((access: any) => {
      const functionName = access.isRemove ? "revokeAccess" : "grantAccess";
      const encodedData = encodeFunctionData({
        abi: worldAbi,
        functionName: functionName,
        args: [access.resourceId, access.address],
      });
      return encodedData;
    });
    const systemLabel = resourceLabel(system);
    acc[systemLabel] = [registerSystemFunctionData, ...accessFunctionDataList];
    return acc;
  }, {} as Record<string, Hex[]>);

  const systemTxs = [
    ...Object.entries(encodedFunctionDataBySystem).map(([systemLabel, encodedFunctionData]) =>
      pRetry(
        () =>
          writeContract(client, {
            chain: client.chain ?? null,
            address: worldDeploy.address,
            abi: worldAbi,
            functionName: "batchCall",
            args: [getBatchCallData(encodedFunctionData)],
          }),
        {
          retries: 3,
          onFailedAttempt: async (error) => {
            const delay = error.attemptNumber * 500;
            debug(`failed to register or change access permission at ${systemLabel}, retrying in ${delay}ms...`);
            await wait(delay);
          },
        }
      )
    ),
  ];
  return await Promise.all([...systemTxs]);
}
