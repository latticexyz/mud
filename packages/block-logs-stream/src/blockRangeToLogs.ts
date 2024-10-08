import { EMPTY, OperatorFunction, concatMap, from, pipe, tap } from "rxjs";
import { FetchLogsOptions, FetchLogsResult, fetchLogs } from "./fetchLogs";
import { AbiEvent } from "abitype";
import { BlockNumber, UnionOmit } from "viem";
import { debug } from "./debug";

export type BlockRangeToLogsOptions<abiEvents extends readonly AbiEvent[]> = UnionOmit<
  FetchLogsOptions<abiEvents>,
  "fromBlock" | "toBlock"
>;

export type BlockRangeToLogsResult<abiEvents extends readonly AbiEvent[]> = OperatorFunction<
  { startBlock: BlockNumber; endBlock: BlockNumber },
  FetchLogsResult<abiEvents>
>;

/**
 * Takes in an observable of `Observable<{ startBlock: bigint, endBlock: bigint }>`
 * and uses a viem `publicClient` to get logs for the contract `address` and
 * matching `events` and emits the logs as they are fetched.
 *
 * @param {BlockRangeToLogsOptions<AbiEvent[]>} options See `BlockRangeToLogsOptions`.
 * @returns {BlockRangeToLogsResult<AbiEvent[]>} An operator function that transforms a stream of block ranges into a stream of fetched logs.
 */
export function blockRangeToLogs<abiEvents extends readonly AbiEvent[]>(
  opts: BlockRangeToLogsOptions<abiEvents>,
): BlockRangeToLogsResult<abiEvents> {
  let fromBlock: bigint;
  let toBlock: bigint;

  return pipe(
    tap(({ endBlock, startBlock }) => {
      fromBlock ??= startBlock;
      toBlock = endBlock;
    }),
    // concatMap only processes the next emission once the inner observable completes,
    // so it always uses the latest `toBlock` value.
    concatMap(() => {
      if (fromBlock > toBlock) return EMPTY;
      debug(`fetching logs for block range ${fromBlock}-${toBlock}`);
      return from(fetchLogs<abiEvents>({ ...opts, fromBlock, toBlock })).pipe(
        tap(({ toBlock }) => {
          fromBlock = toBlock + 1n;
        }),
      );
    }),
  );
}
