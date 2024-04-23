import { Client, parseAbiItem, Hex } from "viem";
import { getLogs } from "viem/actions";
import { storeSpliceStaticDataEvent } from "@latticexyz/store";
import { WorldDeploy, storeTables } from "./common";
import { debug } from "./debug";
import pRetry from "p-retry";
import { wait } from "@latticexyz/common/utils";

export async function getResourceIds({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly Hex[]> {
  // This assumes we only use `ResourceIds._setExists(true)`, which is true as of this writing.
  // TODO: PR to viem's getLogs to accept topics array so we can filter on all store events and quickly recreate this table's current state

  debug("looking up resource IDs for", worldDeploy.address);
  const logs = await pRetry(
    () =>
      getLogs(client, {
        strict: true,
        address: worldDeploy.address,
        fromBlock: worldDeploy.deployBlock,
        toBlock: worldDeploy.stateBlock,
        event: parseAbiItem(storeSpliceStaticDataEvent),
        args: { tableId: storeTables.store_ResourceIds.tableId },
      }),
    {
      retries: 3,
      onFailedAttempt: async (error) => {
        const delay = error.attemptNumber * 500;
        debug(`failed to get logs, retrying in ${delay}ms...`);
        await wait(delay);
      },
    },
  );
  const resourceIds = logs.map((log) => log.args.keyTuple[0]);
  debug("found", resourceIds.length, "resource IDs for", worldDeploy.address);

  return resourceIds;
}
