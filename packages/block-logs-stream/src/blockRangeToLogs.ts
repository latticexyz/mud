import { EMPTY, OperatorFunction, concatMap, from, pipe, tap } from "rxjs";
import { FetchLogsResult, fetchLogs } from "./fetchLogs";
import { AbiEvent } from "abitype";
import { Address, BlockNumber, PublicClient } from "viem";
import { debug } from "./debug";

export type BlockRangeToLogsOptions<TAbiEvents extends readonly AbiEvent[]> = {
  /**
   * [viem `PublicClient`][0] used for fetching logs from the RPC.
   *
   * [0]: https://viem.sh/docs/clients/public.html
   */
  publicClient: PublicClient;
  /**
   * Optional contract address(es) to fetch logs for.
   */
  address?: Address | Address[];
  /**
   * Events to fetch logs for.
   */
  events: TAbiEvents;
  /**
   * Optional maximum block range, if your RPC limits the amount of blocks fetched at a time.
   */
  maxBlockRange?: bigint;
};

export type BlockRangeToLogsResult<TAbiEvents extends readonly AbiEvent[]> = OperatorFunction<
  { startBlock: BlockNumber; endBlock: BlockNumber },
  FetchLogsResult<TAbiEvents>
>;

/**
 * Takes in an observable of `Observable<{ startBlock: bigint, endBlock: bigint }>`
 * and uses a viem `publicClient` to get logs for the contract `address` and
 * matching `events` and emits the logs as they are fetched.
 *
 * @param {BlockRangeToLogsOptions<AbiEvent[]>} options See `BlockRangeToLogsOptions`.
 * @returns {BlockRangeToLogsResult<AbiEvent[]>} An operator function that transforms a stream of block ranges into a stream of fetched logs.
 */
export function blockRangeToLogs<TAbiEvents extends readonly AbiEvent[]>({
  publicClient,
  address,
  events,
  maxBlockRange,
}: BlockRangeToLogsOptions<TAbiEvents>): BlockRangeToLogsResult<TAbiEvents> {
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
      debug("fetching logs for block range", { fromBlock, toBlock });
      return from(
        fetchLogs({
          publicClient,
          address,
          events,
          fromBlock,
          toBlock,
          maxBlockRange,
        })
      ).pipe(
        tap(({ toBlock }) => {
          fromBlock = toBlock + 1n;
        })
      );
    })
  );
}
