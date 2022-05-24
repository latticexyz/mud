import {
  BehaviorSubject,
  combineLatest,
  concat,
  concatMap,
  endWith,
  map,
  Observable,
  range,
  take,
  withLatestFrom,
} from "rxjs";
import { ContractAddressInterface, Contracts, ContractsEventStream, ContractsEventStreamConfig } from "./types";
import { mapObject, stretch } from "@latticexyz/utils";
import { fromWorker } from "observable-webworker";
import { Input, Output } from "./sync.worker";
import { FormatTypes } from "@ethersproject/abi";
import { JsonRpcProvider } from "@ethersproject/providers";

export function createContractsEventStream<C extends Contracts>(
  initialConfig: ContractsEventStreamConfig<C>,
  contracts$: Observable<C>,
  blockNumber$: Observable<number>,
  provider$: Observable<JsonRpcProvider>,
  supportsBatchQueries$: Observable<boolean>,
  maxBlockInterval = 200
): ContractsEventStream<C> {
  const { initialBlockNumber } = initialConfig;

  const config$ = new BehaviorSubject<ContractsEventStreamConfig<C>>(initialConfig);

  const initialSync$ = blockNumber$.pipe(
    take(1), // Take the first block number
    concatMap((blockNr) =>
      // Create a stepped range that ends with the current number
      range(Math.floor((initialBlockNumber || 0) / maxBlockInterval), Math.floor(blockNr / maxBlockInterval)).pipe(
        map((i) => i * maxBlockInterval),
        endWith(blockNr)
      )
    ),
    stretch(32) // Emit one blockNr every 32ms
  );

  // Create a stream in the format expected by the SyncWorker
  const mergedStream$ = combineLatest([
    contracts$.pipe(
      map((c) => {
        return mapObject<C, ContractAddressInterface<C>>(c, (contract) => ({
          address: contract.address,
          interface: contract.interface.format(FormatTypes.json),
        }));
      })
    ),
    config$,
    concat(initialSync$, blockNumber$),
  ]).pipe(withLatestFrom(provider$.pipe(map((provider) => provider.connection.url)), supportsBatchQueries$));

  const workerUrl = new URL("./sync.worker.ts", import.meta.url);
  console.log("Spawning sync worker at", workerUrl);

  const eventStream$ = fromWorker<Input<C>, Output<C>>(() => new Worker(workerUrl, { type: "module" }), mergedStream$);

  return {
    config$,
    eventStream$,
  };
}
