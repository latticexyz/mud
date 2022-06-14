import { awaitPromise, awaitValue, filterNullish, stretch } from "@latticexyz/utils";
import { computed, IObservableValue, observable, runInAction } from "mobx";
import { Component } from "@latticexyz/solecs";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { DoWork, fromWorker, runWorker } from "observable-webworker";
import { concatMap, filter, identity, map, Observable, of, Subject, withLatestFrom } from "rxjs";
import { fetchEventsInBlockRange } from "../networkUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { createReconnectingProvider } from "../createProvider";
import { ContractConfig, ContractTopics, ECSEventWithTx, Mappings, ProviderConfig } from "../types";
import { BigNumber, Contract } from "ethers";
import { createDecoder } from "../createDecoder";
import { Components, ComponentValue, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { Input } from "./Cache.worker";

export type Config<Cm extends Components> = {
  provider: ProviderConfig;
  initialBlockNumber: number;
  topics: ContractTopics[];
  worldContract: ContractConfig;
  mappings: Mappings<Cm>;
};

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
    // Only run this once we have an initial config
    const config = await awaitValue(this.config);
    if (config.initialBlockNumber) this.clientBlockNumber = config.initialBlockNumber;

    // Internal ecs event stream
    const ecsEvent$ = new Subject<ECSEventWithTx<Cm>>();

    // Create cache and get the cache block number
    const cache = await initCache<{ ComponentValues: ComponentValue<SchemaOf<Cm[keyof Cm]>>; BlockNumber: number }>(
      "ECSCache",
      ["ComponentValues", "BlockNumber"]
    );

    const cacheBlockNumber = (await cache.get("BlockNumber", "current")) ?? 0;

    // Init from cache if the cache is more up to date than the initial client block number
    if (cacheBlockNumber > this.clientBlockNumber) {
      this.clientBlockNumber = cacheBlockNumber;
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
    }

    const { providers, connected } = await createReconnectingProvider(computed(() => this.config.get().provider));

    const { blockNumber$ } = createBlockNumberStream(providers, {
      initialSync: { initialBlockNumber: config.initialBlockNumber, interval: 200 },
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
            const componentContract = new Contract(address, ComponentAbi.abi, providers.get().json) as Component;
            const [keys, values] = await componentContract.getSchema();
            decoder = createDecoder(keys, values);
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

    // Stream ECS events to the Cache worker to store them to IndexDB
    const cacheWorker = new Worker(new URL("./Cache.worker.ts", import.meta.url), { type: "module" });
    fromWorker<Input<Cm>, boolean>(() => cacheWorker, ecsEvent$.pipe(withLatestFrom(blockNumber$))).subscribe(); // Need to subscribe to make the stream flow

    // Stream ECS events to the main thread
    ecsEvent$.subscribe(this.output$);
  }

  public work(input$: Observable<Config<Cm>>): Observable<Output<Cm>> {
    input$.subscribe((config) => runInAction(() => this.config.set(config)));
    return this.output$.asObservable();
  }
}

runWorker(SyncWorker);
