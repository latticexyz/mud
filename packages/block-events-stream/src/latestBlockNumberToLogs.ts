import { OperatorFunction, exhaustMap, from, tap } from "rxjs";
import { FetchLogsResult, fetchLogs } from "./fetchLogs";
import { AbiEvent, Address } from "abitype";
import { BlockNumber, PublicClient } from "viem";

export type BlockRangeToLogsOptions<TAbiEvents extends readonly AbiEvent[]> = {
  publicClient: PublicClient;
  address?: Address | Address[];
  events: TAbiEvents;
  fromBlock: BlockNumber;
  maxBlockRange?: bigint;
};

export type BlockRangeToLogsResult<TAbiEvents extends readonly AbiEvent[]> = OperatorFunction<
  BlockNumber,
  FetchLogsResult<TAbiEvents>
>;

export function blockRangeToLogs<TAbiEvents extends readonly AbiEvent[]>({
  publicClient,
  address,
  events,
  fromBlock: initialFromBlock,
  maxBlockRange,
}: BlockRangeToLogsOptions<TAbiEvents>): BlockRangeToLogsResult<TAbiEvents> {
  let fromBlock = initialFromBlock;
  return exhaustMap((latestBlockNumber: bigint) =>
    from(
      fetchLogs({
        publicClient,
        address,
        events,
        fromBlock,
        toBlock: latestBlockNumber,
        maxBlockRange,
      })
    ).pipe(
      tap((result) => {
        fromBlock = result.toBlock + 1n;
      })
    )
  );
}
