/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { stretch } from "@latticexyz/utils";
import { IComputedValue, reaction } from "mobx";
import { concat, concatMap, EMPTY, endWith, filter, map, range, ReplaySubject, take } from "rxjs";
import { Providers } from "./createProvider";

/**
 * Creates a stream of block numbers based on the `block` event of the currently connected provider.
 * In case `initialSync` is provided, this stream will also output a stream of past block numbers to drive replaying events.
 *
 * @param providers Mobx computed providers object (created by {@link createReconnectingProvider}).
 * @param options
 * @returns Stream of block numbers based on connected provider's `block` event.
 */
export function createBlockNumberStream(
  providers: IComputedValue<Providers | undefined>,
  options?: {
    initialSync?: {
      initialBlockNumber: number;
      interval: number;
    };
  }
) {
  const blockNumberEvent$ = new ReplaySubject<number>(1);

  const initialSync$ = options?.initialSync
    ? blockNumberEvent$.pipe(
        take(1), // Take the first block number
        filter((blockNr) => blockNr > (options.initialSync!.initialBlockNumber || 0)), // Only do inital sync if the first block number we receive is larger than the block number to start from
        concatMap((blockNr) => {
          // Create a stepped range that ends with the current number
          const blocksToSync = blockNr - options.initialSync!.initialBlockNumber;
          return range(0, Math.ceil(blocksToSync / options.initialSync!.interval)).pipe(
            map((i) => options.initialSync!.initialBlockNumber + i * options.initialSync!.interval),
            endWith(blockNr)
          );
        }),
        stretch(50) // Stretch processing of block number to one every 32 milliseconds (during initial sync)
      )
    : EMPTY;

  const dispose = reaction(
    () => providers.get(),
    (currProviders) => {
      const provider = currProviders?.ws || currProviders?.json;

      let streamEmpty = true;
      // Get the current block number (skipped if a new block arrives faster)
      provider?.getBlockNumber().then((blockNumber) => {
        if (streamEmpty) {
          blockNumberEvent$.next(blockNumber);
        }
      });
      // Stream new block numbers
      provider?.on("block", (blockNumber: number) => {
        streamEmpty = false;
        blockNumberEvent$.next(blockNumber);
      });
    },
    { fireImmediately: true }
  );

  const blockNumber$ = concat(initialSync$, blockNumberEvent$);

  return { blockNumber$, dispose };
}
