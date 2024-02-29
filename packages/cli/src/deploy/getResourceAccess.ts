import { Client, parseAbiItem, Hex, Address, getAddress } from "viem";
import { WorldDeploy, worldTables } from "./common";
import { debug } from "./debug";
import { storeSpliceStaticDataEvent } from "@latticexyz/store";
import { getLogs } from "viem/actions";
import { decodeKey } from "@latticexyz/protocol-parser";
import { getTableValue } from "./getTableValue";

export async function getResourceAccess({
  client,
  worldDeploy,
}: {
  readonly client: Client;
  readonly worldDeploy: WorldDeploy;
}): Promise<readonly { readonly resourceId: Hex; readonly address: Address }[]> {
  // This assumes we only use `ResourceAccess._set(...)`, which is true as of this writing.
  // TODO: PR to viem's getLogs to accept topics array so we can filter on all store events and quickly recreate this table's current state

  debug("looking up resource access for", worldDeploy.address);

  const logs = await getLogs(client, {
    strict: true,
    fromBlock: worldDeploy.deployBlock,
    toBlock: worldDeploy.stateBlock,
    address: worldDeploy.address,
    // our usage of `ResourceAccess._set(...)` emits a splice instead of set record
    // TODO: https://github.com/latticexyz/mud/issues/479
    event: parseAbiItem(storeSpliceStaticDataEvent),
    args: { tableId: worldTables.world_ResourceAccess.tableId },
  });

  const keys = logs.map((log) => decodeKey(worldTables.world_ResourceAccess.keySchema, log.args.keyTuple));

  const access = (
    await Promise.all(
      keys.map(
        async (key) =>
          [key, await getTableValue({ client, worldDeploy, table: worldTables.world_ResourceAccess, key })] as const
      )
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
