import { Client, Transport, Chain, Account, Address, parseAbiItem, Hex } from "viem";
import { getLogs } from "viem/actions";
import { getWorldDeploy } from "./getWorldDeploy";
import { storeSpliceStaticData } from "@latticexyz/store";
import { storeTables } from "./common";
import { debug } from "./debug";

export async function getResourceIds(
  client: Client<Transport, Chain | undefined, Account>,
  worldAddress: Address
): Promise<Hex[]> {
  const worldDeploy = await getWorldDeploy(client, worldAddress);

  // This assumes we only use `ResourceIds._setExists(true)`, which is true as of this writing.

  // TODO: PR to viem's getLogs to accept topics array so we can filter on all store events and quickly recreate this table's current state

  debug("looking up resource IDs for", worldAddress);
  const logs = await getLogs(client, {
    strict: true,
    fromBlock: worldDeploy.blockNumber,
    address: worldAddress,
    event: parseAbiItem(storeSpliceStaticData),
    args: { tableId: storeTables.store_ResourceIds.tableId },
  });

  const resourceIds = logs.map((log) => log.args.keyTuple[0]);
  debug("found", resourceIds.length, "resource IDs for", worldAddress);

  return resourceIds;
}
