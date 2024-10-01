import { Client, Hex, Address, getAddress } from "viem";
import { WorldDeploy } from "./common";
import { debug } from "./debug";
import { decodeKey, getKeySchema, getSchemaTypes } from "@latticexyz/protocol-parser/internal";
import { getTableValue } from "./getTableValue";
import worldConfig from "@latticexyz/world/mud.config";
import { fetchBlockLogs } from "@latticexyz/block-logs-stream";
import { flattenStoreLogs, getStoreLogs } from "@latticexyz/store/internal";

export async function getResourceAccess({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly { readonly resourceId: Hex; readonly address: Address }[]> {
  debug("looking up resource access for", worldDeploy.address);

  const blockLogs = await fetchBlockLogs({
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    async getLogs({ fromBlock, toBlock }) {
      return getStoreLogs(client, {
        address: worldDeploy.address,
        fromBlock,
        toBlock,
        tableId: worldConfig.namespaces.world.tables.ResourceAccess.tableId,
      });
    },
  });
  const logs = flattenStoreLogs(blockLogs.flatMap((block) => block.logs));

  const keys = logs.map((log) =>
    decodeKey(getSchemaTypes(getKeySchema(worldConfig.namespaces.world.tables.ResourceAccess)), log.args.keyTuple),
  );

  const access = (
    await Promise.all(
      keys.map(
        async (key) =>
          [
            key,
            await getTableValue({
              client,
              worldDeploy,
              table: worldConfig.namespaces.world.tables.ResourceAccess,
              key,
            }),
          ] as const,
      ),
    )
  )
    .filter(([, value]) => value.access)
    .map(([key]) => ({
      resourceId: key.resourceId,
      address: getAddress(key.caller),
    }));

  debug("found", access.length, "resource<>address access pairs");

  return access;
}
