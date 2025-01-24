import { BlockNumber } from "viem";
import { logSort } from "@latticexyz/common";
import { bigIntSort, groupBy } from "@latticexyz/common/utils";

type PartialLog = { readonly blockNumber: bigint; readonly logIndex: number };

export type GroupLogsByBlockNumberResult<log extends PartialLog> = {
  readonly blockNumber: log["blockNumber"];
  readonly logs: readonly log[];
}[];

/**
 * Groups logs by their block number.
 *
 * @remarks
 * This function takes an array of logs and returns a new array where each item corresponds to a distinct block number.
 * Each item in the output array includes the block number, the block hash, and an array of all logs for that block.
 * Pending logs are filtered out before processing, as they don't have block numbers.
 *
 * @param logs The logs to group by block number.
 * @param toBlock If specified, always include this block number at the end, even if there are no logs.
 *
 * @returns An array of objects where each object represents a distinct block and includes the block number,
 * the block hash, and an array of logs for that block.
 */
export function groupLogsByBlockNumber<log extends PartialLog>(
  logs: readonly log[],
  toBlock?: BlockNumber,
): GroupLogsByBlockNumberResult<log> {
  const blockNumbers = Array.from(new Set(logs.map((log) => log.blockNumber)));
  blockNumbers.sort(bigIntSort);

  const sortedLogs = logs.slice().sort(logSort);
  const groupedBlocks = Array.from(groupBy(sortedLogs, (log) => log.blockNumber).entries())
    .map(([blockNumber, logs]) => ({ blockNumber, logs }))
    .filter((block) => block.logs.length > 0);

  const lastBlockNumber = blockNumbers.at(-1);

  if (toBlock != null && (lastBlockNumber == null || toBlock > lastBlockNumber)) {
    groupedBlocks.push({
      blockNumber: toBlock,
      logs: [],
    });
  }

  return groupedBlocks;
}
