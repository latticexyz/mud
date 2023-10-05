import { Client, Transport, Chain, Account, Hex, getAddress } from "viem";
import { writeContract } from "@latticexyz/common";
import { System, WorldDeploy, worldAbi } from "./common";
import { ensureContract } from "./ensureContract";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getSystems } from "./getSystems";
import { ensureSystemFunctions } from "./ensureSystemFunctions";

export async function ensureSystems({
  client,
  worldDeploy,
  systems,
}: {
  client: Client<Transport, Chain | undefined, Account>;
  worldDeploy: WorldDeploy;
  systems: System[];
}): Promise<Hex[]> {
  const worldSystems = await getSystems({ client, worldDeploy });

  const existing = systems.filter((system) =>
    worldSystems.find(
      (worldSystem) =>
        worldSystem.systemId === system.systemId && getAddress(worldSystem.address) === getAddress(system.address)
    )
  );
  if (existing.length > 0) {
    debug("existing systems", existing.map(resourceLabel).join(", "));
  }
  const existingSystemIds = existing.map((system) => system.systemId);

  const missing = systems.filter((system) => !existingSystemIds.includes(system.systemId));
  if (!missing.length) return [];

  const systemsToUpgrade = missing.filter((system) =>
    worldSystems.find(
      (worldSystem) =>
        worldSystem.systemId === system.systemId && getAddress(worldSystem.address) !== getAddress(system.address)
    )
  );
  if (systemsToUpgrade.length) {
    debug("upgrading systems", systemsToUpgrade.map(resourceLabel).join(", "));
  }

  const systemsToAdd = missing.filter(
    (system) => !worldSystems.find((worldSystem) => worldSystem.systemId === system.systemId)
  );
  if (systemsToAdd.length) {
    debug("registering new systems", systemsToAdd.map(resourceLabel).join(", "));
  }

  // kick off contract deployments first, otherwise registering systems can fail
  const contractTxs = await Promise.all(
    missing.map((system) => ensureContract(client, system.bytecode, `${resourceLabel(system)} system`))
  );

  // then start registering systems
  const registerTxs = await Promise.all(
    missing.map((system) =>
      writeContract(client, {
        chain: client.chain ?? null,
        address: worldDeploy.address,
        abi: worldAbi,
        // TODO: replace with batchCall
        functionName: "registerSystem",
        args: [system.systemId, system.address, system.allowAll],
      })
    )
  );

  // then register system functions
  const functionTxs = await Promise.all(
    missing.map((system) => ensureSystemFunctions({ client, worldDeploy, system }))
  );

  const txs = [...contractTxs, ...registerTxs, ...functionTxs];

  return (await Promise.all(txs)).flat();
}
