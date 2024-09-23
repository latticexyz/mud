import { AbiEvent } from "viem";
import { GroupLogsByBlockNumberResult, groupLogsByBlockNumber } from "./groupLogsByBlockNumber";
import { FetchLogsOptions, FetchLogsResult, fetchLogs } from "./fetchLogs";
import { iteratorToArray } from "@latticexyz/common/utils";

/**
 * Fetches all logs from the blockchain for the given range, grouped by block number.
 *
 * @remarks
 * The function will fetch logs according to the given options.
 * If the function encounters rate limits, it will retry until `maxRetryCount` is reached.
 * If the function encounters a block range that is too large, it will half the block range and retry, until the block range can't be halved anymore.
 *
 * @param {FetchLogsOptions<AbiEvent[]>} options See `FetchLogsOptions`.
 *
 * @returns {GroupLogsByBlockNumberResult} See `GroupLogsByBlockNumberResult`.
 *
 * @throws Will throw an error if the block range can't be reduced any further.
 */
export async function fetchBlockLogs<abiEvents extends readonly AbiEvent[]>(
  opts: FetchLogsOptions<abiEvents>,
): Promise<GroupLogsByBlockNumberResult<FetchLogsResult<abiEvents>["logs"][number]>> {
  const fetchedLogs = await iteratorToArray(fetchLogs(opts));
  const logs = fetchedLogs.flatMap(({ logs }) => logs);
  return groupLogsByBlockNumber(logs);
}
