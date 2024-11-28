import { Client, Hex, Address, getAddress } from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import worldConfig from "@latticexyz/world/mud.config";
import { getRecords } from "@latticexyz/store-sync";

export async function getResourceAccess({
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly { readonly resourceId: Hex; readonly address: Address }[]> {
  debug("looking up resource access for", worldDeploy.address);

  const { records } = await getRecords({
    table: worldConfig.namespaces.world.tables.ResourceAccess,
    worldAddress: worldDeploy.address,
    indexerUrl: "https://indexer.mud.garnetchain.com",
    chainId: 17069,
  });
  const access = records
    .filter((record) => record.access)
    .map((record) => ({
      resourceId: record.resourceId,
      address: getAddress(record.caller),
    }));

  debug("found", access.length, "resource<>address access pairs");

  return access;
}
