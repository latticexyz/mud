import { Hex, Address, getAddress, Client } from "viem";
import { CommonDeployOptions } from "./common";
import { debug } from "./debug";
import worldConfig from "@latticexyz/world/mud.config";
import { getRecords } from "@latticexyz/store-sync";

export async function getResourceAccess({
  client,
  worldDeploy,
  indexerUrl,
  chainId,
}: Omit<CommonDeployOptions, "client"> & { client: Client }): Promise<
  readonly { readonly resourceId: Hex; readonly address: Address }[]
> {
  debug("looking up resource access for", worldDeploy.address);

  const { records } = await getRecords({
    table: worldConfig.namespaces.world.tables.ResourceAccess,
    worldAddress: worldDeploy.address,
    indexerUrl,
    chainId,
    client,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
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
