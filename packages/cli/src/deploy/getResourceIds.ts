import { Client, Hex } from "viem";
import { CommonDeployOptions } from "./common";
import { debug } from "./debug";
import storeConfig from "@latticexyz/store/mud.config";
import { getRecords } from "@latticexyz/store-sync";

export async function getResourceIds({
  client,
  worldDeploy,
  indexerUrl,
  chainId,
}: Omit<CommonDeployOptions, "client"> & { client: Client }): Promise<readonly Hex[]> {
  debug("looking up resource IDs for", worldDeploy.address);
  const { records } = await getRecords({
    table: storeConfig.namespaces.store.tables.ResourceIds,
    worldAddress: worldDeploy.address,
    indexerUrl,
    chainId,
    client,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
  });
  const resourceIds = records.map((record) => record.resourceId);

  debug("found", resourceIds.length, "resource IDs for", worldDeploy.address);
  return resourceIds;
}
