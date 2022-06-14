/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IComputedValue, reaction } from "mobx";
import { concat, concatMap, EMPTY, endWith, map, range, ReplaySubject, take } from "rxjs";
import { Providers } from "./types";

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
        concatMap((blockNr) =>
          // Create a stepped range that ends with the current number
          range(
            Math.floor(options.initialSync!.initialBlockNumber / options.initialSync!.interval),
            Math.floor(blockNr / options.initialSync!.interval)
          ).pipe(
            map((i) => i * options.initialSync!.interval),
            endWith(blockNr)
          )
        )
      )
    : EMPTY;

  const dispose = reaction(
    () => providers.get(),
    (currProviders) => {
      const provider = currProviders?.ws || currProviders?.json;
      provider?.on("block", (blockNumber: number) => blockNumberEvent$.next(blockNumber));
    },
    { fireImmediately: true }
  );

  const blockNumber$ = concat(initialSync$, blockNumberEvent$);

  return { blockNumber$, dispose };
}
