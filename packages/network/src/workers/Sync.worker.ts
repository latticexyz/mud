import { awaitPromise, awaitValue, filterNullish, stretch } from "@latticexyz/utils";
import { computed, IObservableValue, observable, runInAction } from "mobx";
import { DoWork, runWorker } from "observable-webworker";
import { concatMap, distinctUntilChanged, filter, identity, map, Observable, of, Subject, withLatestFrom } from "rxjs";
import { fetchEventsInBlockRange } from "../networkUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { createReconnectingProvider } from "../createProvider";
import { ContractConfig, ContractTopics, Mappings, ProviderConfig } from "../types";
import { BigNumber } from "ethers";
import { createDecoder } from "../createDecoder";
import { Components, ComponentValue, ExtendableECSEvent, SchemaOf } from "@latticexyz/recs";
import { createCache } from "../createCache";

export type Config<Cm extends Components> = {
  provider: ProviderConfig;
  initialBlockNumber: number;
  topics: ContractTopics[];
  worldContract: ContractConfig;
  mappings: Mappings<Cm>;
};

export type ECSEventWithTx<C extends Components> = ExtendableECSEvent<
  C,
  { lastEventInTx: boolean; txHash: string; entity: string }
>;

export type Output<Cm extends Components> = ECSEventWithTx<Cm>;

export class SyncWorker<Cm extends Components> implements DoWork<Config<Cm>, Output<Cm>> {
  private config = observable.box<Config<Cm>>() as IObservableValue<Config<Cm>>;
  private clientBlockNumber = 0;
  private decoders: { [key: string]: (data: string) => unknown } = {};
  private output$ = new Subject<Output<Cm>>();

  constructor() {
    this.init();
  }

  private async init() {
    // Internal ecs event stream
    const ecsEvent$ = new Subject<ECSEventWithTx<Cm>>(); // TODO: Very weird hack, if we don't do it like this, we can only subscribe to the stream once...

    // Create cache and get the cache block number
    const cache = await createCache<{ ComponentValues: ComponentValue<SchemaOf<Cm[keyof Cm]>>; BlockNumber: number }>(
      "ECSCache",
      ["ComponentValues", "BlockNumber"]
    );

    const cacheBlockNumber = (await cache.get("BlockNumber", "current")) ?? 0;
    if (cacheBlockNumber) this.clientBlockNumber = cacheBlockNumber;

    // Init from cache
    const cacheEntries = await cache.entries("ComponentValues");
    for (const [key, value] of cacheEntries) {
      const componentEntity = key.split("/");
      const [component, entity] = componentEntity;
      const ecsEvent: ECSEventWithTx<Cm> = {
        component,
        entity,
        value,
        lastEventInTx: false,
        txHash: "cache",
      };

      this.output$.next(ecsEvent);
    }

    // Only run this once we have an initial config
    await awaitValue(this.config);

    const { providers, connected } = await createReconnectingProvider(computed(() => this.config.get().provider));

    const { blockNumber$ } = createBlockNumberStream(providers, {
      // TODO: Start from given initial block number
      initialSync: { initialBlockNumber: 0, interval: 200 },
    });

    // If ECS sidecar is not available, fetch events from contract on every new block
    blockNumber$
      .pipe(
        filter((blockNumber) => blockNumber > cacheBlockNumber), // Ignore the block numbers lower than our cached block number
        stretch(32), // Stretch processing of block number to one every 32 milliseconds (mainly relevant for initial sync)
        withLatestFrom(awaitValue(this.config), awaitValue(connected)), // Only process if config is available and connected
        map(([blockNumber, config]) => {
          const events = fetchEventsInBlockRange(
            providers.get().json,
            config.topics,
            this.clientBlockNumber + 1,
            blockNumber,
            { World: config.worldContract },
            config.provider.options?.batch
          );

          this.clientBlockNumber = blockNumber;
          return events;
        }),
        concatMap(identity), // Await promises
        concatMap((v) => of(...v)), // Flatten contract event array into stream of contract events
        map(async (event) => {
          if (event.contractKey !== "World") return; // We only care about events from the World contract
          if (event.eventKey !== "ComponentValueSet" && event.eventKey !== "ComponentValueRemoved") return; // We only care about these events

          const {
            component: address,
            entity,
            data,
            componentId,
          } = event.args as unknown as {
            component: string;
            entity: BigNumber;
            data: string;
            componentId: BigNumber;
          };

          const contractComponentId = BigNumber.from(componentId).toHexString();
          const clientComponentKey = this.config.get().mappings[contractComponentId];

          if (!clientComponentKey) return; // No client mapping for this component contract

          // Create decoder and cache for later
          let decoder = this.decoders[contractComponentId];
          if (!decoder) {
            decoder = await createDecoder(address, providers.get().json);
            this.decoders[contractComponentId] = decoder;
          }

          return {
            component: clientComponentKey,
            value: decoder(data) as ComponentValue<SchemaOf<Cm[typeof clientComponentKey]>>,
            entity: BigNumber.from(entity).toHexString(),
            lastEventInTx: event.lastEventInTx,
            txHash: event.txHash,
          };
        }),
        awaitPromise(),
        filterNullish() // Only emit if a ECS event was constructed
      )
      .subscribe(ecsEvent$);

    // Stream ECS events to the Cache worker
    // TODO: move this to its own worker
    ecsEvent$
      .pipe(map((event) => ({ key: `${event.component}/${event.entity}`, value: event.value })))
      .subscribe(({ key, value }) => {
        cache.set("ComponentValues", key, value); // The cache is initialized before we process the first event
      });

    // Only set this if the block number changed
    ecsEvent$.pipe(withLatestFrom(blockNumber$), distinctUntilChanged()).subscribe(([, blockNumber]) => {
      cache.set("BlockNumber", "current", blockNumber);
    });

    // Stream ECS events to the main thread
    ecsEvent$.subscribe(this.output$);
  }

  public work(input$: Observable<Config<Cm>>): Observable<Output<Cm>> {
    input$.subscribe((config) => runInAction(() => this.config.set(config)));
    return this.output$.asObservable();
  }
}

runWorker(SyncWorker);
