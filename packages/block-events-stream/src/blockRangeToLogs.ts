import { EMPTY, OperatorFunction, concatMap, from, pipe, tap } from "rxjs";
import { FetchLogsResult, fetchLogs } from "./fetchLogs";
import { AbiEvent, Address } from "abitype";
import { BlockNumber, PublicClient } from "viem";

export type BlockRangeToLogsOptions<TAbiEvents extends readonly AbiEvent[]> = {
  publicClient: PublicClient;
  address?: Address | Address[];
  events: TAbiEvents;
  maxBlockRange?: bigint;
};

export type BlockRangeToLogsResult<TAbiEvents extends readonly AbiEvent[]> = OperatorFunction<
  { startBlock: BlockNumber; endBlock: BlockNumber },
  FetchLogsResult<TAbiEvents>
>;

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
    // so it always uses the latest toBlock value.
    concatMap(() => {
      if (fromBlock > toBlock) return EMPTY;
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
