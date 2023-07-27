import type { Log } from "viem";

// TODO: get rid of this once https://github.com/wagmi-dev/viem/pull/847 lands

export type NonPendingLog<TLog extends Log> = TLog & {
  blockHash: NonNullable<TLog["blockHash"]>;
  blockNumber: NonNullable<TLog["blockNumber"]>;
  logIndex: NonNullable<TLog["logIndex"]>;
  transactionHash: NonNullable<TLog["transactionHash"]>;
  transactionIndex: NonNullable<TLog["transactionIndex"]>;
};

export function isNonPendingLog<TLog extends Log>(log: TLog): log is NonPendingLog<TLog> {
  return (
    log.blockHash != null &&
    log.blockNumber != null &&
    log.logIndex != null &&
    log.transactionHash != null &&
    log.transactionIndex != null
  );
}
