import { DeployedSystem, worldDeployEvents } from "./common";
import { Client, Address, parseAbi } from "viem";
import { getBlockNumber, getLogs } from "viem/actions";
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
}: {
  readonly client: Client;
  readonly worldAddress: Address;
}): Promise<readonly DeployedSystem[]> {
  const stateBlock = await getBlockNumber(client);
  const logs = await getLogs(client, {
    strict: true,
    address: worldAddress,
    events: parseAbi(worldDeployEvents),
    // this may fail for certain RPC providers with block range limits
    // if so, could potentially use our fetchLogs helper (which does pagination)
    fromBlock: "earliest",
    toBlock: stateBlock,
  });
  const deployBlock = logs[0].blockNumber;

  const [resourceIds, functions, resourceAccess] = await Promise.all([
    getResourceIds({ client, worldAddress, deployBlock, stateBlock }),
    getFunctions({ client, worldAddress, deployBlock, stateBlock }),
    getResourceAccess({ client, worldAddress, deployBlock, stateBlock }),
  ]);
  const systems = resourceIds.map(hexToResource).filter((resource) => resource.type === "system");

  debug("looking up systems", systems.map(resourceToLabel).join(", "));
  return await Promise.all(
    systems.map(async (system): Promise<DeployedSystem> => {
      const { system: address, publicAccess } = await getTableValue({
        client,
        worldAddress,
        stateBlock,
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
