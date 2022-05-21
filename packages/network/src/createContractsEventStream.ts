import {
  BehaviorSubject,
  combineLatest,
  concat,
  concatMap,
  endWith,
  map,
  Observable,
  of,
  range,
  Subject,
  take,
  withLatestFrom,
} from "rxjs";
import * as ethers from "ethers";
import { Contracts } from "./types";
import { Result } from "ethers/lib/utils";
import { stretch } from "@mud/utils";
import { fetchEventsInBlockRange } from "./networkUtils";

export type ContractTopics<C extends Contracts> = {
  key: keyof C;
  topics: string[][];
};

export type ContractEvent<C extends Contracts> = {
  contractKey: keyof C;
  eventKey: string;
  args: Result;
  txHash: string;
  lastEventInTx: boolean;
};

interface ContractsEventStreamConfig<C extends Contracts> {
  contractTopics: ContractTopics<C>[];
  initialBlockNumber?: number;
}

export type ContractsEventStream<C extends Contracts> = {
  config$: Subject<ContractsEventStreamConfig<C>>;
  eventStream$: Observable<ContractEvent<C>>;
};

export function createContractsEventStream<C extends Contracts>(
  initialConfig: ContractsEventStreamConfig<C>,
  contracts$: Observable<C>,
  blockNumber$: Observable<number>,
  provider$: Observable<ethers.providers.JsonRpcProvider>,
  supportsBatchQueries$: Observable<boolean>,
  maxBlockInterval = 200
): ContractsEventStream<C> {
  const { initialBlockNumber } = initialConfig;

  const config$ = new BehaviorSubject<ContractsEventStreamConfig<C>>(initialConfig);
  let lastSyncedBlockNumber = initialBlockNumber || 0;

  const initialSync$ = blockNumber$.pipe(
    take(1), // Take the first block number
    concatMap((blockNr) =>
      // Create a stepped range that ends with the current number
      range(Math.floor(lastSyncedBlockNumber / maxBlockInterval), Math.floor(blockNr / maxBlockInterval)).pipe(
        map((i) => i * maxBlockInterval),
        endWith(blockNr)
      )
    ),
    stretch(30) // Emit one event every 10ms
  );

  const mergedStream$ = combineLatest([contracts$, config$, concat(initialSync$, blockNumber$)]);
  const eventStream$ = mergedStream$.pipe(
    withLatestFrom(provider$, supportsBatchQueries$),
    map(([[contracts, config, blockNumber], provider, supportsBatchQueries]) => {
      const events = fetchEventsInBlockRange(
        provider,
        config.contractTopics,
        lastSyncedBlockNumber + 1,
        blockNumber,
        contracts,
        supportsBatchQueries
      );
      lastSyncedBlockNumber = blockNumber;
      return events;
    }),
    concatMap((i) => i),
    // we flatten the stream into a stream of ContractEvent
    map((v) => of(...v)),
    concatMap((v) => v)
  );

  return {
    config$,
    eventStream$,
  };
}
