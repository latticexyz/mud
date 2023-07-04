import { BlockNumber, Hex, Log } from "viem";
import { NonPendingLog, isNonPendingLog } from "./isNonPendingLog";
import { bigIntSort } from "./utils";
import { isDefined } from "@latticexyz/common/utils";
import { debug } from "./debug";

/**
 * Groups logs by their block number.
 *
 * @remarks
 * This function takes an array of logs and returns a new array where each item corresponds to a distinct block number.
 * Each item in the output array includes the block number, the block hash, and an array of all logs for that block.
 * Pending logs are filtered out before processing, as they don't have block numbers.
 *
 * @param logs The logs to group by block number.
 *
 * @returns An array of objects where each object represents a distinct block and includes the block number,
 * the block hash, and an array of logs for that block.
 */
export function groupLogsByBlockNumber<TLog extends Log>(
  logs: readonly TLog[]
): { blockNumber: BlockNumber; blockHash: Hex; logs: readonly NonPendingLog<TLog>[] }[] {
  // Pending logs don't have block numbers, so filter them out.
  const nonPendingLogs = logs.filter(isNonPendingLog);
  if (logs.length !== nonPendingLogs.length) {
    debug(
      "pending logs discarded",
      logs.filter((log) => !isNonPendingLog(log))
    );
  }

  const blockNumbers = Array.from(new Set(nonPendingLogs.map((log) => log.blockNumber)));
  blockNumbers.sort(bigIntSort);

  return blockNumbers
    .map((blockNumber) => {
      const blockLogs = nonPendingLogs.filter((log) => log.blockNumber === blockNumber);
      if (!blockLogs.length) return;
      blockLogs.sort((a, b) => (a.logIndex < b.logIndex ? -1 : a.logIndex > b.logIndex ? 1 : 0));

      if (!blockLogs.length) return;

      return {
        blockNumber,
        blockHash: blockLogs[0].blockHash,
        logs: blockLogs,
      };
    })
    .filter(isDefined);
}
