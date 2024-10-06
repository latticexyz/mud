import { Client, Hex } from "viem";
import { flattenStoreLogs, getStoreLogs } from "@latticexyz/store/internal";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import storeConfig from "@latticexyz/store/mud.config";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";

export async function getResourceIds({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Hex[]> {
  debug("looking up resource IDs for", worldDeploy.address);

  const blockLogs = await fetchBlockLogs({
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    maxBlockRange: 100_000n,
    async getLogs({ fromBlock, toBlock }) {
      return getStoreLogs(client, {
        address: worldDeploy.address,
        fromBlock,
        toBlock,
        tableId: storeConfig.namespaces.store.tables.ResourceIds.tableId,
      });
    },
  });
  const logs = flattenStoreLogs(blockLogs.flatMap((block) => block.logs));

  const resourceIds = logs.map((log) => log.args.keyTuple[0]);
  debug("found", resourceIds.length, "resource IDs for", worldDeploy.address);

  return resourceIds;
}
