import type { Log } from "viem";

type NonPendingLog<TLog extends Log> = TLog & {
  blockHash: NonNullable<TLog["blockHash"]>;
  blockNumber: NonNullable<TLog["blockNumber"]>;
  logIndex: NonNullable<TLog["logIndex"]>;
  transactionHash: NonNullable<TLog["transactionHash"]>;
  transactionIndex: NonNullable<TLog["transactionIndex"]>;
};

export function excludePendingLogs<TLog extends Log>(logs: TLog[]): NonPendingLog<TLog>[] {
  return logs.filter(
    (log) =>
      log.blockHash != null &&
      log.blockNumber != null &&
      log.logIndex != null &&
      log.transactionHash != null &&
      log.transactionIndex != null
  ) as NonPendingLog<TLog>[];
}
