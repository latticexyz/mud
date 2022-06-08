import { awaitValue } from "@latticexyz/utils";
import { computed, observable } from "mobx";
import { DoWork, runWorker } from "observable-webworker";
import { concatMap, identity, map, Observable, of, Subject, withLatestFrom } from "rxjs";
import { fetchEventsInBlockRange } from "../networkUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { createReconnectingProvider } from "../createProvider";
import { ContractEvent, Contracts, ContractsConfig, ContractTopics, ProviderConfig } from "../types";

export type Config<Cn extends Contracts> = {
  provider: ProviderConfig;
  initialBlockNumber: number;
  topics: ContractTopics<Cn>[];
  contracts: ContractsConfig<Cn>;
};

export type Output<Cn extends Contracts> = ContractEvent<Cn>;

export class SyncWorker<Cn extends Contracts> implements DoWork<Config<Cn>, Output<Cn>> {
  private config = observable.box<Config<Cn>>();
  private clientBlockNumber = 1;
  private output$ = new Subject<Output<Cn>>();

  constructor() {
    this.init();
  }

  private async init() {
    // Only run this once we have an initial config
    await awaitValue(this.config);
    const { providers, connected } = await createReconnectingProvider(computed(() => this.config.get().provider));

    const { blockNumber$ } = createBlockNumberStream(providers, {
      // TODO: Start from given initial block number
      initialSync: { initialBlockNumber: 0, interval: 200, gap: 32 },
    });

    // If ECS sidecar is not available
    blockNumber$
      .pipe(
        withLatestFrom(awaitValue(this.config), awaitValue(connected)), // Only process if config is available and connected
        map(([blockNumber, config]) => {
          const events = fetchEventsInBlockRange(
            providers.get().json,
            config.topics,
            this.clientBlockNumber + 1,
            blockNumber,
            config.contracts,
            config.provider.options?.batch
          );

          this.clientBlockNumber = blockNumber;
          return events;
        }),
        concatMap(identity), // Await promises
        concatMap((v) => of(...v)) // Flatten contract event array into stream of contract events
      )
      .subscribe(this.output$);
  }

  public work(input$: Observable<Config<Cn>>): Observable<Output<Cn>> {
    input$.subscribe((config) => this.config.set(config));
    return this.output$.asObservable();
  }
}

runWorker(SyncWorker);
