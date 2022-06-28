import { awaitPromise, awaitValue, computedToStream, deferred, filterNullish } from "@latticexyz/utils";
import { computed, IObservableValue, observable, runInAction } from "mobx";
import { Component, World } from "@latticexyz/solecs";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import WorldAbi from "@latticexyz/solecs/abi/World.json";
import { DoWork, fromWorker, runWorker } from "observable-webworker";
import { combineLatest, concatMap, filter, map, Observable, of, startWith, Subject } from "rxjs";
import { fetchEventsInBlockRange } from "../networkUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { ConnectionState, createReconnectingProvider } from "../createProvider";
import { NetworkComponentUpdate, SyncWorkerConfig } from "../types";
import { BigNumber, BytesLike, Contract } from "ethers";
import { createDecoder } from "../createDecoder";
import { Components, ComponentValue, EntityID, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { Input } from "./Cache.worker";
import { getCacheId } from "./utils";
import { createTopics } from "../createTopics";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { ECSStateSnapshotServiceClient } from "../snapshot.client";
import { ECSStateReply } from "../snapshot";
import { Provider } from "@ethersproject/providers";

async function getLatestCheckpoint(
  checkpointServiceUrl: string,
  cache: ReturnType<typeof initCache>
): Promise<ECSStateReply | undefined> {
  try {
    const localCheckpoint: ECSStateReply = await cache.get("Checkpoint", "latest");
    if (localCheckpoint) {
      console.log("Using cached checkpoint checkpoint", localCheckpoint);
      return localCheckpoint;
    }
    const transport = new GrpcWebFetchTransport({ baseUrl: checkpointServiceUrl, format: "binary" });
    const client = new ECSStateSnapshotServiceClient(transport);
    console.log("Fetching remote checkpoint");
    const { response: remoteCheckpoint } = await client.getStateLatest({});
    cache.set("Checkpoint", "latest", remoteCheckpoint);
    return remoteCheckpoint;
  } catch (e) {
    console.warn("Failed to fetch from checkpoint service:", e);
  }
}

export type Output<Cm extends Components> = NetworkComponentUpdate<Cm>;

export class SyncWorker<Cm extends Components> implements DoWork<SyncWorkerConfig<Cm>, Output<Cm>> {
  private config = observable.box<SyncWorkerConfig<Cm>>() as IObservableValue<SyncWorkerConfig<Cm>>;
  private clientBlockNumber = 0;
  private decoders: { [key: string]: Promise<(data: BytesLike) => unknown> | ((data: BytesLike) => unknown) } = {};
  private componentIdToAddress: { [key: string]: string } = {};
  private toOutput$ = new Subject<Output<Cm>>();

  constructor() {
    this.init();
  }

  private async getComponentAddress(componentId: string, provider: Provider) {
    // If cached address is available, return it
    let componentAddress = this.componentIdToAddress[componentId];
    if (componentAddress) return componentAddress;

    // Otherwise fetch the address from the world
    const worldContract = new Contract(this.config.get().worldContract.address, WorldAbi.abi, provider) as World;
    console.log("Fetching address for component", componentId);
    componentAddress = await worldContract.getComponent(componentId);

    // Cache the address for later before returning it
    this.componentIdToAddress[componentId] = componentAddress;
    return componentAddress;
  }

  private async decode<C extends keyof Cm>(
    provider: Provider,
    data: BytesLike,
    componentId: string,
    componentAddress?: string
  ): Promise<{ component: C; value: ComponentValue<SchemaOf<Cm[C]>> } | undefined> {
    const clientComponentKey = this.config.get().mappings[componentId];

    // No client mapping for this component contract
    if (!clientComponentKey) {
      console.warn("Received unknown component update", componentId);
      return;
    }

    // Fetch the component address if not given
    if (!componentAddress) componentAddress = await this.getComponentAddress(componentId, provider);

    // Create decoder and cache for later
    if (!this.decoders[componentId]) {
      const [resolve, , promise] = deferred<(data: BytesLike) => unknown>();
      this.decoders[componentId] = promise; // Immediately save the promise, so following calls can await it
      const componentContract = new Contract(componentAddress, ComponentAbi.abi, provider) as Component;
      console.log("Fetching component schema");
      const [keys, values] = await componentContract.getSchema();
      resolve(createDecoder(keys, values));
    }

    // Decode the data
    const decoder = await this.decoders[componentId];

    return {
      component: clientComponentKey as C,
      value: decoder(data) as ComponentValue<SchemaOf<Cm[typeof clientComponentKey]>>,
    };
  }

  private async init() {
    // Only run this once we have an initial config
    const config = await awaitValue(this.config);

    // Create providers
    const { providers, connected } = await createReconnectingProvider(computed(() => this.config.get().provider));

    // Create streams for ECS events that should go to cache and output
    const toCacheAndOutput$ = new Subject<NetworkComponentUpdate<Cm>>();
    const toCacheBlockNumber$ = new Subject<number>();

    // Setup pipes to cache and output

    // 1. stream ECS events to the main thread
    toCacheAndOutput$.subscribe(this.toOutput$);

    // 2. stream ECS events to the Cache worker to store them to IndexDB
    if (!config.disableCache) {
      fromWorker<Input<Cm>, boolean>(
        () => new Worker(new URL("./Cache.worker.ts", import.meta.url), { type: "module" }),
        combineLatest([
          toCacheAndOutput$.pipe(startWith(undefined)),
          toCacheBlockNumber$.pipe(startWith(undefined)),
          of(config.worldContract.address),
          of(config.chainId),
        ]) // Emits if either of the sources emit and starts immediately (emitting undefined as first value for ecsEvent and blockNumber)
      ).subscribe(); // Need to subscribe to make the stream flow
    }

    // Set the client block number to the block number we want to start from
    if (config.initialBlockNumber) this.clientBlockNumber = config.initialBlockNumber;

    // Create cache and get the cache block number
    const cache = await initCache<{
      ComponentValues: ComponentValue<SchemaOf<Cm[keyof Cm]>>;
      BlockNumber: number;
      Entities: number;
      Components: number;
      Checkpoint: ECSStateReply;
    }>(
      getCacheId(config.chainId, config.worldContract.address), // Store a separate cache for each World contract address
      ["ComponentValues", "BlockNumber", "Entities", "Components", "Checkpoint"]
    );

    const cacheBlockNumber = (await cache.get("BlockNumber", "current")) ?? 0;

    // Fetch latest checkpoint
    console.log("Checking remote checkpoint at", config.checkpointServiceUrl);
    const checkpoint = config.checkpointServiceUrl
      ? await getLatestCheckpoint(config.checkpointServiceUrl, cache)
      : undefined;

    // Load from cache if cache is enabled,
    // the cache is at a higher block number than where we want to start from,
    // and there is no checkpoint with a higher number available
    if (
      !config.disableCache &&
      cacheBlockNumber > this.clientBlockNumber &&
      cacheBlockNumber > (checkpoint?.blockNumber ?? 0)
    ) {
      console.log("Loading from cache at block", cacheBlockNumber);
      this.clientBlockNumber = cacheBlockNumber; // Set the current client block number to the cache block number to avoid refetching from blocks before that

      // Initialize maps
      const indexToEntity = new Map<number, EntityID>();
      const indexToComponent = new Map<number, string>();

      const entities = await cache.entries("Entities");
      for (const [id, index] of entities) {
        indexToEntity.set(index, id as EntityID);
      }

      const components = await cache.entries("Components");
      for (const [id, index] of components) {
        indexToComponent.set(index, id);
      }

      const cacheEntries = await cache.entries("ComponentValues");
      for (const [key, value] of cacheEntries) {
        const [componentIndex, entityIndex] = key.split("/");
        const component = indexToComponent.get(Number(componentIndex));
        const entity = indexToEntity.get(Number(entityIndex));

        if (!entity || !component) {
          console.warn("Unknown component or entity", component, entity);
          continue;
        }

        const ecsEvent: NetworkComponentUpdate<Cm> = {
          component,
          entity,
          value,
          lastEventInTx: false,
          txHash: "cache",
        };

        this.toOutput$.next(ecsEvent);
      }
    }

    // Load from checkpoint if there is checkpoint
    // and the checkpoint is at a higher block number than where we want to start from
    if (checkpoint && checkpoint.blockNumber > this.clientBlockNumber) {
      console.log("Loading from checkpoint at block", checkpoint.blockNumber);
      this.clientBlockNumber = Number(checkpoint.blockNumber); // Set the current client block number to the checkpoint block number to avoid refetching from blocks before that
      for (const { entityId: entity, componentId, value } of checkpoint.state) {
        const decoded = await this.decode(providers.get().json, value, componentId);
        if (!decoded) continue; // There might not be a decoded value if the component id is unknown

        const ecsEvent: NetworkComponentUpdate<Cm> = {
          ...decoded,
          entity: BigNumber.from(entity).toHexString() as EntityID,
          lastEventInTx: false,
          txHash: "checkpoint",
        };

        toCacheAndOutput$.next(ecsEvent);
      }
    }

    const { blockNumber$ } = createBlockNumberStream(providers, {
      initialSync: { initialBlockNumber: this.clientBlockNumber, interval: 20 },
    });
    blockNumber$.subscribe(toCacheBlockNumber$);

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

          // Decode the event
          const contractComponentId = BigNumber.from(componentId).toHexString();

          // Handle ComponentValueRemoved event
          if (event.eventKey === "ComponentValueRemoved") {
            const clientComponentKey = this.config.get().mappings[contractComponentId];
            if (!clientComponentKey) {
              console.warn("Received unknown component update from", address);
              return;
            }
            return {
              component: clientComponentKey,
              value: undefined,
              entity: BigNumber.from(entity).toHexString() as EntityID,
              lastEventInTx: event.lastEventInTx,
              txHash: event.txHash,
            };
          }

          // Handle ComponentValueSet event
          const decoded = await this.decode(providers.get().json, data, contractComponentId, address);
          if (!decoded) return; // There might not be a decoded value if the component id is unknown

          return {
            ...decoded,
            entity: BigNumber.from(entity).toHexString() as EntityID,
            lastEventInTx: event.lastEventInTx,
            txHash: event.txHash,
          };
        }),
        awaitPromise(),
        filterNullish() // Only emit if a ECS event was constructed
      )
      .subscribe(toCacheAndOutput$);
  }

  public work(input$: Observable<SyncWorkerConfig<Cm>>): Observable<Output<Cm>> {
    input$.subscribe((config) => runInAction(() => this.config.set(config)));
    return this.toOutput$.asObservable();
  }
}

runWorker(SyncWorker);
