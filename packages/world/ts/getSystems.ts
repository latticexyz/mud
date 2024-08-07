import { DeployedSystem } from "./common";
import { Client, Address } from "viem";
import { getResourceIds } from "./getResourceIds";
import { hexToResource, resourceToLabel } from "@latticexyz/common";
import { getTableValue } from "./getTableValue";
import { debug } from "./debug";
import { getFunctions } from "./getFunctions";
import { getResourceAccess } from "./getResourceAccess";
import worldConfig from "../mud.config";

export async function getSystems({
  client,
  worldAddress,
  stateBlock,
  deployBlock,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly stateBlock: bigint;
  readonly deployBlock: bigint;
}): Promise<readonly DeployedSystem[]> {
  const [resourceIds, functions, resourceAccess] = await Promise.all([
    getResourceIds({
      client,
      worldAddress,
      deployBlock: deployBlock,
      stateBlock: stateBlock,
    }),
    getFunctions({
      client,
      worldAddress,
      deployBlock,
      stateBlock,
    }),
    getResourceAccess({ client, worldAddress, deployBlock, stateBlock }),
  ]);
  const systems = resourceIds.map(hexToResource).filter((resource) => resource.type === "system");

  debug("looking up systems", systems.map(resourceToLabel).join(", "));
  return await Promise.all(
    systems.map(async (system): Promise<DeployedSystem> => {
      const { system: systemAddress, publicAccess } = await getTableValue({
        client,
        worldAddress,
        stateBlock,
        table: worldConfig.namespaces.world.tables.Systems,
        key: { systemId: system.resourceId },
      });
      const worldFunctions = functions.filter((func) => func.systemId === system.resourceId);
      return {
        address: systemAddress,
        namespace: system.namespace,
        name: system.name,
        systemId: system.resourceId,
        allowAll: publicAccess,
        allowedAddresses: resourceAccess
          .filter(({ resourceId }) => resourceId === system.resourceId)
          .map(({ address }) => address),
        worldFunctions,
      };
    }),
  );
}
