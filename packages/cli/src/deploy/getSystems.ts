import { CommonDeployOptions, DeployedSystem } from "./common";
import { hexToResource, resourceToLabel } from "@latticexyz/common";
import { getFunctions } from "@latticexyz/store-sync/world";
import { getResourceIds } from "./getResourceIds";
import { getTableValue } from "./getTableValue";
import { debug } from "./debug";
import { getResourceAccess } from "./getResourceAccess";
import worldConfig from "@latticexyz/world/mud.config";
import { Client } from "viem";

export async function getSystems({
  client,
  worldDeploy,
  indexerUrl,
  chainId,
}: Omit<CommonDeployOptions, "client"> & { client: Client }): Promise<readonly DeployedSystem[]> {
  const [resourceIds, functions, resourceAccess] = await Promise.all([
    getResourceIds({ client, worldDeploy, indexerUrl, chainId }),
    getFunctions({
      client,
      worldAddress: worldDeploy.address,
      fromBlock: worldDeploy.deployBlock,
      toBlock: worldDeploy.stateBlock,
      indexerUrl,
      chainId,
    }),
    getResourceAccess({ client, worldDeploy, indexerUrl, chainId }),
  ]);
  const systems = resourceIds.map(hexToResource).filter((resource) => resource.type === "system");

  debug("looking up systems:", systems.map(resourceToLabel).join(", "));
  return await Promise.all(
    systems.map(async (system): Promise<DeployedSystem> => {
      const { system: address, publicAccess } = await getTableValue({
        client,
        worldDeploy,
        table: worldConfig.namespaces.world.tables.Systems,
        key: { systemId: system.resourceId },
      });
      const worldFunctions = functions.filter((func) => func.systemId === system.resourceId);
      return {
        address,
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
