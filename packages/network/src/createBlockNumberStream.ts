/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { stretch } from "@latticexyz/utils";
import { IComputedValue, reaction } from "mobx";
import { concat, concatMap, EMPTY, endWith, map, range, ReplaySubject, take } from "rxjs";
import { Providers } from "./types";

export function createBlockNumberStream(
  providers: IComputedValue<Providers | undefined>,
  options?: {
    initialSync?: {
      initialBlockNumber: number;
      interval: number;
      gap: number;
    };
  }
) {
  const blockNumber$ = new ReplaySubject<number>(1);

  const initialSync$ = options?.initialSync
    ? blockNumber$.pipe(
        take(1), // Take the first block number
        concatMap((blockNr) =>
          // Create a stepped range that ends with the current number
          range(
            Math.floor(options.initialSync!.initialBlockNumber / options.initialSync!.interval),
            Math.floor(blockNr / options.initialSync!.interval)
          ).pipe(
            map((i) => i * options.initialSync!.interval),
            endWith(blockNr)
          )
        ),
        stretch(options.initialSync.gap) // Emit one blockNr every x ms
      )
    : EMPTY;

  const dispose = reaction(
    () => providers.get(),
    (currProviders) => {
      const provider = currProviders?.ws || currProviders?.json;
      provider?.on("block", (blockNumber: number) => blockNumber$.next(blockNumber));
    },
    { fireImmediately: true }
  );

  return { blockNumber$: concat(initialSync$, blockNumber$), dispose };
}
