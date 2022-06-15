import { awaitPromise, awaitValue, computedToStream, deferred, filterNullish } from "@latticexyz/utils";
import { computed, IObservableValue, observable, runInAction } from "mobx";
import { Component, World } from "@latticexyz/solecs";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import WorldAbi from "@latticexyz/solecs/abi/World.json";
import { DoWork, fromWorker, runWorker } from "observable-webworker";
import { combineLatest, concatMap, filter, map, Observable, of, Subject, withLatestFrom } from "rxjs";
import { fetchEventsInBlockRange } from "../networkUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { ConnectionState, createReconnectingProvider } from "../createProvider";
import { ContractConfig, ECSEventWithTx, Mappings, ProviderConfig } from "../types";
import { BigNumber, Contract } from "ethers";
import { createDecoder } from "../createDecoder";
import { Components, ComponentValue, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { Input } from "./Cache.worker";
import { getCacheId } from "./utils";
import { createTopics } from "../createTopics";

export type Config<Cm extends Components> = {
  provider: ProviderConfig;
  initialBlockNumber: number;
  worldContract: ContractConfig;
  mappings: Mappings<Cm>;
  disableCache?: boolean;
  chainId: number;
};

export type Output<Cm extends Components> = ECSEventWithTx<Cm>;

export class SyncWorker<Cm extends Components> implements DoWork<Config<Cm>, Output<Cm>> {
  private config = observable.box<Config<Cm>>() as IObservableValue<Config<Cm>>;
  private clientBlockNumber = 0;
  private decoders: { [key: string]: Promise<(data: string) => unknown> | ((data: string) => unknown) } = {};
  private output$ = new Subject<Output<Cm>>();

  constructor() {
    this.init();
  }

  private async init() {
    // Only run this once we have an initial config
    const config = await awaitValue(this.config);
    // Set the client block number to the block number we want to start from
    if (config.initialBlockNumber) this.clientBlockNumber = config.initialBlockNumber;

    // Create cache and get the cache block number
    const cache = await initCache<{ ComponentValues: ComponentValue<SchemaOf<Cm[keyof Cm]>>; BlockNumber: number }>(
      getCacheId(config.chainId, config.worldContract.address), // Store a separate cache for each World contract address
      ["ComponentValues", "BlockNumber"]
    );

    const cacheBlockNumber = (await cache.get("BlockNumber", "current")) ?? 0;

    // Init from cache if the cache is more up to date than the block number we want to start from
    if (!config.disableCache && cacheBlockNumber > this.clientBlockNumber) {
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
      initialSync: { initialBlockNumber: this.clientBlockNumber, interval: 200 },
    });

    // Internal ECS event stream (we need to create this subject and then push to it in order to be able to listen to it at multiple places)
    const ecsEvent$ = new Subject<ECSEventWithTx<Cm>>();

    // Create World topics to listen to
    const topics = createTopics<{ World: World }>({
      World: { abi: WorldAbi.abi, topics: ["ComponentValueSet", "ComponentValueRemoved"] },
    });

    // If ECS sidecar is not available, fetch events from contract on every new block
    combineLatest([blockNumber$, computedToStream(this.config), computedToStream(connected)])
      .pipe(
        filter(([, , connectionState]) => connectionState === ConnectionState.CONNECTED),
        map(([blockNumber, config]) => {
          const events = fetchEventsInBlockRange(
            providers.get().json,
            topics,
            this.clientBlockNumber + 1,
            blockNumber,
            { World: config.worldContract },
            config.provider.options?.batch
          );

          this.clientBlockNumber = blockNumber;
          return events;
        }),
        awaitPromise(), // Await promises
        concatMap((v) => of(...v)), // Flatten contract event array into stream of contract events
        map(async (event) => {
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

          // No client mapping for this component contract
          if (!clientComponentKey) {
            console.warn("Received unknown component update from", address);
            return;
          }

          // Create decoder and cache for later
          if (!this.decoders[contractComponentId]) {
            const [resolve, , promise] = deferred<(data: string) => unknown>();
            this.decoders[contractComponentId] = promise; // Immediately save the promise, so following calls can await it
            const componentContract = new Contract(address, ComponentAbi.abi, providers.get().json) as Component;
            const [keys, values] = await componentContract.getSchema();
            resolve(createDecoder(keys, values));
          }
          const decoder = await this.decoders[contractComponentId];

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
    fromWorker<Input<Cm>, boolean>(
      () => new Worker(new URL("./Cache.worker.ts", import.meta.url), { type: "module" }),
      ecsEvent$.pipe(withLatestFrom(blockNumber$, of(config.worldContract.address), of(config.chainId)))
    ).subscribe(); // Need to subscribe to make the stream flow

    // Stream ECS events to the main thread
    ecsEvent$.subscribe(this.output$);
  }

  public work(input$: Observable<Config<Cm>>): Observable<Output<Cm>> {
    input$.subscribe((config) => runInAction(() => this.config.set(config)));
    return this.output$.asObservable();
  }
}

runWorker(SyncWorker);
