import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  map,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throttleTime,
  withLatestFrom,
} from "rxjs";
import * as ethers from "ethers";
import { createStatefulSync } from "./createStatefulSync";
import { Contracts } from "./types";
import { Result } from "ethers/lib/utils";

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
  lastSyncedBlockNumber$: Observable<number>;
};

export function createContractsEventStream<C extends Contracts>(
  initialConfig: ContractsEventStreamConfig<C>,
  contracts$: Observable<C>,
  blockNumber$: Observable<number>,
  provider$: Observable<ethers.providers.JsonRpcProvider>,
  supportsBatchQueries$: Observable<boolean>
): ContractsEventStream<C> {
  const { initialBlockNumber } = initialConfig;

  const config$ = new BehaviorSubject<ContractsEventStreamConfig<C>>(initialConfig);
  const lastSyncedBlockNumber$ = new ReplaySubject<number>(1);

  const statefulSync = createStatefulSync<C>(initialBlockNumber || 0, lastSyncedBlockNumber$);

  const mergedStream$ = combineLatest([contracts$, config$, blockNumber$]);
  const eventStream$ = mergedStream$.pipe(
    withLatestFrom(provider$, supportsBatchQueries$),
    throttleTime(1000, undefined, { leading: true, trailing: true }),
    concatMap(([[contracts, config, blockNumber], provider, supportsBatchQueries]) =>
      statefulSync.sync(provider, config.contractTopics, blockNumber, contracts, supportsBatchQueries)
    ),
    // we flatten the stream into a stream of ContractEvent
    map((v) => of(...v)),
    concatMap((v) => v)
  );

  return {
    config$,
    eventStream$,
    lastSyncedBlockNumber$: lastSyncedBlockNumber$.asObservable(),
  };
}
