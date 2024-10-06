import { GroupLogsByBlockNumberResult, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { StoreEventsLog } from "../src/common";

export function logsToBlocks(
  rpcLogs: { data: string; topics: string[] }[],
): GroupLogsByBlockNumberResult<StoreEventsLog> {
  return groupLogsByBlockNumber(
    rpcLogs.map((log) => {
      const { eventName, args } = decodeEventLog({
        abi: storeEventsAbi,
        data: log.data as Hex,
        topics: log.topics as [Hex, ...Hex[]],
        strict: true,
      });
      return formatLog(log as RpcLog, { args, eventName: eventName as string }) as StoreEventsLog;
    }),
  );
}
