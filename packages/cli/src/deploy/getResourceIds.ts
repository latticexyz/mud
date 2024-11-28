import { Client, Hex } from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import storeConfig from "@latticexyz/store/mud.config";
import { getRecords } from "@latticexyz/store-sync";

export async function getResourceIds({
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Hex[]> {
  debug("looking up resource IDs for", worldDeploy.address);
  const { records } = await getRecords({
    table: storeConfig.namespaces.store.tables.ResourceIds,
    worldAddress: worldDeploy.address,
    indexerUrl: "https://indexer.mud.garnetchain.com",
    chainId: 17069,
  });
  const resourceIds = records.map((record) => record.resourceId);

  debug("found", resourceIds.length, "resource IDs for", worldDeploy.address);
  return resourceIds;
}
