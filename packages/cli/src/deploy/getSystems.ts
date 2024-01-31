import { System, WorldDeploy, worldTables } from "./common";
import { Client } from "viem";
import { getResourceIds } from "./getResourceIds";
import { hexToResource } from "@latticexyz/common";
import { getTableValue } from "./getTableValue";
import { debug } from "./debug";
import { resourceLabel } from "./resourceLabel";
import { getFunctions } from "./getFunctions";
import { getResourceAccess } from "./getResourceAccess";

export async function getSystems({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Omit<System, "abi" | "bytecode" | "deployedBytecodeSize">[]> {
  const [resourceIds, functions, resourceAccess] = await Promise.all([
    getResourceIds({ client, worldDeploy }),
    getFunctions({ client, worldDeploy }),
    getResourceAccess({ client, worldDeploy }),
  ]);
  const systems = resourceIds.map(hexToResource).filter((resource) => resource.type === "system");

  debug("looking up systems", systems.map(resourceLabel).join(", "));
  return await Promise.all(
    systems.map(async (system) => {
      const { system: address, publicAccess } = await getTableValue({
        client,
        worldDeploy,
        table: worldTables.world_Systems,
        key: { systemId: system.resourceId },
      });
      const systemFunctions = functions.filter((func) => func.systemId === system.resourceId);
      return {
        address,
        namespace: system.namespace,
        name: system.name,
        systemId: system.resourceId,
        allowAll: publicAccess,
        allowedAddresses: resourceAccess
          .filter(({ resourceId }) => resourceId === system.resourceId)
          .map(({ address }) => address),
        functions: systemFunctions,
      };
    })
  );
}
