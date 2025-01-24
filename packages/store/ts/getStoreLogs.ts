import {
  BlockNumber,
  BlockTag,
  Address,
  Log,
  Hex,
  GetLogsErrorType,
  Client,
  toEventSelector,
  LogTopic,
  RpcLog,
  numberToHex,
  formatLog,
  parseEventLogs,
} from "viem";
import { storeEventsAbi } from "./storeEventsAbi";
import { debug } from "./debug";
import { hexToResource, resourceToLabel } from "@latticexyz/common";

export type GetStoreLogsParameters<
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
> = {
  /** Store address or list of store addresses from which logs originated */
  address?: Address | Address[] | undefined;
  /** Optionally match a specific table ID or list of table IDs */
  tableId?: Hex | Hex[] | undefined;
  /** Block number or tag after which to include logs */
  fromBlock?: fromBlock | BlockNumber | BlockTag | undefined;
  /** Block number or tag before which to include logs */
  toBlock?: toBlock | BlockNumber | BlockTag | undefined;
};

export type GetStoreLogsReturnType<
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
  _pending extends boolean = (fromBlock extends "pending" ? true : false) | (toBlock extends "pending" ? true : false),
> = Log<bigint, number, _pending, undefined, true, storeEventsAbi, undefined>[];

export type GetStoreLogsErrorType = GetLogsErrorType;

/**
 * Returns an unordered list of store event logs matching the provided parameters.
 *
 * @param client - Client to use
 * @param parameters - {@link GetStoreLogsParameters}
 * @returns A list of event logs. {@link GetStoreLogsReturnType}
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getStoreLogs } from '@latticexyz/store'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const storeLogs = await getStoreLogs(client)
 */
export async function getStoreLogs<
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
>(
  client: Client,
  { address, tableId, fromBlock, toBlock }: GetStoreLogsParameters<fromBlock, toBlock> = {},
): Promise<GetStoreLogsReturnType<fromBlock, toBlock>> {
  /**
   * Note that this implementation follows Viem's [`getLogs`][0] action:
   * https://github.com/wevm/viem/blob/main/src/actions/public/getLogs.ts
   *
   * It's adapted to allow filtering by table ID(s), which Viem's `getLogs`
   * does not support due to how it builds topics.
   */

  const topics: LogTopic[] = [storeEventsAbi.map(toEventSelector), tableId ?? null];

  const tableIds = tableId ? (Array.isArray(tableId) ? tableId : [tableId]) : [];
  const addresses = address ? (Array.isArray(address) ? address : [address]) : [];
  debug(
    `getting store logs for ${
      tableIds.length ? tableIds.map(hexToResource).map(resourceToLabel).join(", ") : "all tables"
    } at ${addresses.length ? addresses.join(", ") : "any address"}`,
  );

  const logs: RpcLog[] = await client.request({
    method: "eth_getLogs",
    params: [
      {
        address,
        topics,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
      },
    ],
  });

  const formattedLogs = logs.map((log) => formatLog(log));
  return parseEventLogs({
    abi: storeEventsAbi,
    args: { tableId },
    logs: formattedLogs,
    strict: true,
  }) as GetStoreLogsReturnType<fromBlock, toBlock>;
}
