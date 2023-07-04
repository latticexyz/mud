import { AbiEvent } from "abitype";
import {
  Address,
  BlockNumber,
  BlockTag,
  Log,
  PublicClient,
  decodeEventLog,
  encodeEventTopics,
  numberToHex,
  formatLog,
} from "viem";
import { isDefined } from "@latticexyz/common/utils";

// Based on https://github.com/wagmi-dev/viem/blob/main/src/actions/public/getLogs.ts
// TODO: swap this out once viem has support for multiple events: https://github.com/wagmi-dev/viem/pull/633

export type GetLogsOptions<TAbiEvents extends readonly AbiEvent[]> = {
  publicClient: PublicClient;
  address?: Address | Address[];
  events: TAbiEvents;
  fromBlock: BlockNumber | BlockTag;
  toBlock: BlockNumber | BlockTag;
};

export type GetLogsResult<TAbiEvents extends readonly AbiEvent[]> = Log<
  bigint,
  number,
  TAbiEvents[number],
  true,
  TAbiEvents
>[];

export async function getLogs<TAbiEvents extends readonly AbiEvent[]>({
  publicClient,
  address,
  events,
  fromBlock,
  toBlock,
}: GetLogsOptions<TAbiEvents>): Promise<GetLogsResult<TAbiEvents>> {
  const topics = [events.flatMap((event) => encodeEventTopics({ abi: [event], eventName: event.name }))];

  const logs = await publicClient.request({
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

  return logs
    .map((log) => {
      try {
        const { eventName, args } = decodeEventLog({
          abi: events,
          data: log.data,
          topics: log.topics,
          strict: true,
        });
        return formatLog(log, { args, eventName });
      } catch (err) {
        // We're using strict mode, so just skip if there is an error decoding.
        // https://viem.sh/docs/actions/public/getLogs.html#strict-mode
        return;
      }
    })
    .filter(isDefined) as GetLogsResult<TAbiEvents>;
}
