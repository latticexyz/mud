import { BlockNumber } from "viem";
import { bigIntSort, isDefined } from "@latticexyz/common/utils";

type PartialLog = { blockNumber: bigint; logIndex: number };

export type GroupLogsByBlockNumberResult<TLog extends PartialLog> = {
  blockNumber: TLog["blockNumber"];
  logs: TLog[];
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
export function groupLogsByBlockNumber<TLog extends PartialLog>(
  logs: readonly TLog[],
  toBlock?: BlockNumber
): GroupLogsByBlockNumberResult<TLog> {
  const blockNumbers = Array.from(new Set(logs.map((log) => log.blockNumber)));
  blockNumbers.sort(bigIntSort);

  const groupedBlocks = blockNumbers
    .map((blockNumber) => {
      const blockLogs = logs.filter((log) => log.blockNumber === blockNumber);
      if (!blockLogs.length) return;
      blockLogs.sort((a, b) => (a.logIndex < b.logIndex ? -1 : a.logIndex > b.logIndex ? 1 : 0));

      if (!blockLogs.length) return;

      return {
        blockNumber,
        logs: blockLogs,
      };
    })
    .filter(isDefined);

  const lastBlockNumber = blockNumbers.length > 0 ? blockNumbers[blockNumbers.length - 1] : null;

  if (toBlock != null && (lastBlockNumber == null || toBlock > lastBlockNumber)) {
    groupedBlocks.push({
      blockNumber: toBlock,
      logs: [],
    });
  }

  return groupedBlocks;
}
