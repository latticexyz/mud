import { System, WorldDeploy, worldTables } from "./common";
import { Client } from "viem";
import { getResourceIds } from "./getResourceIds";
import { hexToResource } from "@latticexyz/common";
import { getTableValue } from "./getTableValue";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getFunctions } from "./getFunctions";

export async function getSystems({
  client,
  worldDeploy,
}: {
  client: Client;
  worldDeploy: WorldDeploy;
}): Promise<System[]> {
  const resourceIds = await getResourceIds({ client, worldDeploy });
  const functions = await getFunctions({ client, worldDeploy });
  const systems = resourceIds.map(hexToResource).filter((resource) => resource.type === "system");

  debug("looking up systems", systems.map(resourceLabel).join(", "));
  return await Promise.all(
    systems.map(async (system) => {
      const { system: address, publicAccess } = await getTableValue({
        client,
        worldDeploy,
        table: worldTables.world_Systems,
        key: { systemId: system.hex },
      });
      const systemFunctions = functions.filter((func) => func.systemId === system.hex);
      return {
        address,
        namespace: system.namespace,
        name: system.name,
        systemId: system.hex,
        allowAll: publicAccess,
        allowedAddresses: [], // TODO
        allowedSystemIds: [], // TODO
        bytecode: "0x", // TODO
        abi: [], // TODO
        functions: systemFunctions,
      };
    })
  );
}
