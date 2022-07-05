import {
  awaitPromise,
  awaitValue,
  computedToStream,
  deferred,
  DoWork,
  filterNullish,
  fromWorker,
  unpackTuple,
} from "@latticexyz/utils";
import { computed, IObservableValue, observable, runInAction } from "mobx";
import { Component, World } from "@latticexyz/solecs";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import WorldAbi from "@latticexyz/solecs/abi/World.json";
import { combineLatest, concatMap, filter, map, Observable, of, startWith, Subject } from "rxjs";
import { fetchEventsInBlockRange } from "../networkUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { ConnectionState, createReconnectingProvider } from "../createProvider";
import { ContractEvent, Contracts, NetworkComponentUpdate, SyncWorkerConfig } from "../types";
import { BigNumber, BytesLike, Contract } from "ethers";
import { createDecoder } from "../createDecoder";
import { Components, ComponentValue, EntityID, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { Input, State } from "./Cache.worker";
import { getCacheId } from "./utils";
import { createTopics } from "../createTopics";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { ECSStateSnapshotServiceClient } from "../snapshot.client";
import { ECSStateReply } from "../snapshot";
import { Provider } from "@ethersproject/providers";
import { runWorker } from "@latticexyz/utils";

const MAX_CACHE_AGE = 1000;

async function getCheckpoint(
  checkpointServiceUrl: string,
  cache: ReturnType<typeof initCache>,
  cacheBlockNumber: number
): Promise<ECSStateReply | undefined> {
  try {
    // Fetch remote block number
    const transport = new GrpcWebFetchTransport({ baseUrl: checkpointServiceUrl, format: "binary" });
    const client = new ECSStateSnapshotServiceClient(transport);
    const {
      response: { blockNumber: remoteBlockNumber },
    } = await client.getStateBlockLatest({});

    // Ignore checkpoint if local cache is recent enough
    const cacheAge = remoteBlockNumber - cacheBlockNumber;
    if (cacheAge < MAX_CACHE_AGE) return undefined;

    // Check local checkpoint
    const localCheckpoint: ECSStateReply = await cache.get("Checkpoint", "latest");
    const localCheckpointAge = remoteBlockNumber - (localCheckpoint.blockNumber ?? 0);
    // Return local checkpoint if it is recent enough
    if (localCheckpointAge < MAX_CACHE_AGE) {
      console.log("Local checkpoint is recent enough to be used");
      return localCheckpoint;
    }
    console.log("Fetching remote checkpoint");
    const { response: remoteCheckpoint } = await client.getStateLatest({});
    cache.set("Checkpoint", "latest", remoteCheckpoint, true);
    return remoteCheckpoint;
  } catch (e) {
    console.warn("Failed to fetch from checkpoint service:", e);
  }
}

export type Output<Cm extends Components> = NetworkComponentUpdate<Cm>;

export class SyncWorker<Cm extends Components> implements DoWork<SyncWorkerConfig<Cm>, Output<Cm>> {
  private config = observable.box() as IObservableValue<SyncWorkerConfig<Cm>>;
  private clientBlockNumber = 0;
  private decoders: { [key: string]: Promise<(data: BytesLike) => unknown> | ((data: BytesLike) => unknown) } = {};
  private componentIdToAddress: { [key: string]: Promise<string> } = {};
  private toOutput$ = new Subject<Output<Cm>>();
  private schemaCache = initCache<{ ComponentSchemas: [string[], number[]] }>("Global", ["ComponentSchemas"]);
  private cacheWorker?: Worker;

  constructor() {
    this.init();
  }

  private async getComponentAddress(componentId: string, provider: Provider) {
    // If cached address is available, return it
    let componentAddressPromise = this.componentIdToAddress[componentId];
    if (componentAddressPromise) return componentAddressPromise;

    // Otherwise fetch the address from the world
    const worldContract = new Contract(this.config.get().worldContract.address, WorldAbi.abi, provider) as World;
    console.log("Fetching address for component", componentId);
    componentAddressPromise = worldContract.getComponent(componentId);

    // Cache the address for later before returning it
    this.componentIdToAddress[componentId] = componentAddressPromise;
    return componentAddressPromise;
  }

  private async getComponentSchema(address: string, provider: Provider): Promise<[string[], number[]]> {
    const schemaCache = await this.schemaCache;
    const cachedSchema = await schemaCache.get("ComponentSchemas", address);
    if (cachedSchema) {
      console.log("Using cached schema");
      return cachedSchema;
    }

    const componentContract = new Contract(address, ComponentAbi.abi, provider) as Component;
    const schema = await componentContract.getSchema();
    console.log("Using remote schema");
    schemaCache.set("ComponentSchemas", address, schema);
    return schema;
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
      console.warn(componentAddress);
      console.warn("Received unknown component update", componentId);
      return;
    }

    // Fetch the component address if not given
    if (!componentAddress) componentAddress = await this.getComponentAddress(componentId, provider);

    // Create decoder and cache for later
    if (!this.decoders[componentId]) {
      const [resolve, , promise] = deferred<(data: BytesLike) => unknown>();
      this.decoders[componentId] = promise; // Immediately save the promise, so following calls can await it
      const [keys, values] = await this.getComponentSchema(componentAddress, provider);
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

    // Setup pipes to cache and output

    // 1. stream ECS events to the main thread
    toCacheAndOutput$.subscribe(this.toOutput$);

    // 2. stream ECS events to the Cache worker to store them to IndexDB
    this.cacheWorker = new Worker(new URL("./Cache.worker.ts", import.meta.url), { type: "module" });
    if (!config.disableCache) {
      fromWorker<Input<Cm>, boolean>(
        this.cacheWorker,
        combineLatest([
          toCacheAndOutput$.pipe(startWith(undefined)),
          of(config.worldContract.address),
          of(config.chainId),
        ]) // Emits if either of the sources emit and starts immediately (emitting undefined as first value for ecsEvent and blockNumber)
      ).subscribe(); // Need to subscribe to make the stream flow
    }

    // Set the client block number to the block number we want to start from
    if (config.initialBlockNumber) this.clientBlockNumber = config.initialBlockNumber;

    // Create cache and get the cache block number
    const cache = await initCache<{
      ComponentValues: State;
      BlockNumber: number;
      Mappings: string[];
      Checkpoint: ECSStateReply;
    }>(
      getCacheId(config.chainId, config.worldContract.address), // Store a separate cache for each World contract address
      ["ComponentValues", "BlockNumber", "Mappings", "Checkpoint"]
    );

    const cacheBlockNumber = (await cache.get("BlockNumber", "current")) ?? 0;

    // Fetch latest checkpoint
    console.log("Checking remote checkpoint at", config.checkpointServiceUrl);
    const checkpoint = config.checkpointServiceUrl
      ? await getCheckpoint(config.checkpointServiceUrl, cache, cacheBlockNumber)
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
      const state = await cache.get("ComponentValues", "current");
      const components = await cache.get("Mappings", "components");
      const entities = await cache.get("Mappings", "entities");

      if (state && components && entities) {
        this.clientBlockNumber = cacheBlockNumber; // Set the current client block number to the cache block number to avoid refetching from blocks before that
        console.log("State size", state.size);
        for (const [key, value] of state.entries()) {
          const [componentIndex, entityIndex] = unpackTuple(key);
          const component = components[componentIndex];
          const entity = entities[entityIndex];

          if (!entity || !component) {
            console.warn("Unknown component or entity", component, entity);
            continue;
          }

          const ecsEvent: NetworkComponentUpdate<Cm> = {
            component,
            entity: entity as EntityID,
            value: value as ComponentValue<SchemaOf<Cm[keyof Cm]>>,
            lastEventInTx: false,
            txHash: "cache",
            blockNumber: cacheBlockNumber,
          };

          this.toOutput$.next(ecsEvent);
        }
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
          // If the page is reloaded while the cache worker is storing cache from the checkpoint event stream,
          // the cache can end up being incomplete. We therefore set the block number to 0, such that the client
          // will load from the checkpoint again unless a regular event arrived in the meantime (indicating the checkpoint was fully cached).
          blockNumber: 0,
        };

        toCacheAndOutput$.next(ecsEvent);
      }
    }

    const { blockNumber$ } = createBlockNumberStream(providers, {
      initialSync: { initialBlockNumber: this.clientBlockNumber, interval: 50 },
    });

    // Create World topics to listen to
    const topics = createTopics<{ World: World }>({
      World: { abi: WorldAbi.abi, topics: ["ComponentValueSet", "ComponentValueRemoved"] },
    });

    // If ECS sidecar is not available, fetch events from contract on every new block
    combineLatest([blockNumber$, computedToStream(this.config), computedToStream(connected)])
      .pipe(
        filter(([, , connectionState]) => connectionState === ConnectionState.CONNECTED),
        concatMap(async ([blockNumber, config]) => {
          const events = await fetchEventsInBlockRange(
            providers.get().json,
            topics,
            this.clientBlockNumber + 1,
            blockNumber,
            { World: config.worldContract },
            config.provider.options?.batch
          );

          this.clientBlockNumber = blockNumber;
          return [events, blockNumber] as [ContractEvent<Contracts>[], number];
        }),
        concatMap((v) => of(...v[0].map((e) => [e, v[1]] as [ContractEvent<Contracts>, number]))), // Flatten contract event array into stream of [contract event, block number] tuples
        map(async ([event, blockNumber]) => {
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
              blockNumber,
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
            blockNumber,
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

runWorker(new SyncWorker());
