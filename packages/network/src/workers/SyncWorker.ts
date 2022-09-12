import { awaitStreamValue, DoWork, keccak256, streamToDefinedComputed } from "@latticexyz/utils";
import { Observable, Subject } from "rxjs";
import {
  isNetworkComponentUpdateEvent,
  NetworkComponentUpdate,
  NetworkEvent,
  NetworkEvents,
  SyncWorkerConfig,
} from "../types";
import { Components, ComponentValue, SchemaOf } from "@latticexyz/recs";
import {
  createCacheStore,
  getCacheStoreEntries,
  getIndexDBCacheStoreBlockNumber,
  getIndexDbECSCache,
  loadIndexDbCacheStore,
  mergeCacheStores,
  saveCacheStoreToIndexDb,
  storeEvent,
} from "./CacheStore";
import { createReconnectingProvider } from "../createProvider";
import { computed } from "mobx";
import {
  createSnapshotClient,
  createDecode,
  createFetchWorldEventsInBlockRange,
  createLatestEventStream,
  getSnapshotBlockNumber,
  fetchSnapshot,
  fetchStateInBlockRange,
  createFetchSystemCallData,
} from "./syncUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { GodID, SyncState } from "./constants";

export class SyncWorker<C extends Components> implements DoWork<SyncWorkerConfig, NetworkEvent<C>> {
  private input$ = new Subject<SyncWorkerConfig>();
  private output$ = new Subject<NetworkEvent<C>>();

  constructor() {
    this.init();
  }

  /**
   * Pass a loading state component update to the main thread.
   * Can be used to indicate the initial loading state on a loading screen.
   * @param state {@link SyncState}
   * @param msg Message to describe the current loading step.
   * @param percentage Number between 0 and 100 to describe the loading progress.
   * @param blockNumber Optional: block number to pass in the component update.
   */
  private setLoadingState(state: SyncState, msg: string, percentage: number, blockNumber = 0) {
    const update: NetworkComponentUpdate<C> = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: keccak256("component.LoadingState"),
      value: { state, msg, percentage } as unknown as ComponentValue<SchemaOf<C[keyof C]>>,
      entity: GodID,
      txHash: "worker",
      lastEventInTx: false,
      blockNumber,
    };

    this.output$.next(update);
  }

  /**
   * Start the sync process.
   *
   * 1. Get config
   * 2. Load initial state
   *   2.1 Get cache block number
   *   2.2 Get snapshot block number
   *   2.3 Load from more recent source
   * 3. Cach up to current block number by requesting events from RPC ( -> TODO: Replace with own service)
   * 4. Keep in sync
   *  4.1 If available keep in sync with streaming service
   *  4.2 Else keep in sync with RPC
   */
  private async init() {
    this.setLoadingState(SyncState.CONNECTING, "Connecting...", 0);

    // Turn config into variable accessible outside the stream
    const computedConfig = await streamToDefinedComputed(this.input$);
    const {
      checkpointServiceUrl,
      chainId,
      worldContract,
      provider: { options: providerOptions },
      initialBlockNumber,
      fetchSystemCalls,
    } = computedConfig.get();

    // Set up
    const { providers } = await createReconnectingProvider(computed(() => computedConfig.get().provider));
    const provider = providers.get().json;
    const snapshotClient = checkpointServiceUrl ? createSnapshotClient(checkpointServiceUrl) : undefined;
    const indexDbCache = await getIndexDbECSCache(chainId, worldContract.address);
    const decode = createDecode(worldContract, provider);
    const fetchWorldEvents = createFetchWorldEventsInBlockRange(
      provider,
      worldContract,
      providerOptions?.batch,
      decode
    );

    // Start syncing current events, but only start streaming to output once gap between initial state and current block is closed

    console.log("[SyncWorker] start initial sync");
    this.setLoadingState(SyncState.INITIAL, "Starting initial sync", 0);
    let passLiveEventsToOutput = false;
    const cacheStore = { current: createCacheStore() };
    const { blockNumber$ } = createBlockNumberStream(providers);
    createLatestEventStream(
      blockNumber$,
      fetchWorldEvents,
      fetchSystemCalls ? createFetchSystemCallData(provider) : undefined
    ).subscribe((event) => {
      if (isNetworkComponentUpdateEvent(event)) storeEvent(cacheStore.current, event);
      if (passLiveEventsToOutput) this.output$.next(event as NetworkEvent<C>);
    });
    const streamStartBlockNumberPromise = awaitStreamValue(blockNumber$);

    // Load initial state from cache or snapshot service
    this.setLoadingState(SyncState.INITIAL, "Fetching cache block number", 20);
    const cacheBlockNumber = await getIndexDBCacheStoreBlockNumber(indexDbCache);
    const snapshotBlockNumber = await getSnapshotBlockNumber(snapshotClient, worldContract.address);
    console.log(
      `[SyncWorker] cache block: ${cacheBlockNumber}, snapshot block: ${snapshotBlockNumber}, start sync at ${initialBlockNumber}`
    );
    let initialState = createCacheStore();
    if (initialBlockNumber > Math.max(cacheBlockNumber, snapshotBlockNumber)) {
      initialState.blockNumber = initialBlockNumber;
    } else {
      const syncFromSnapshot = snapshotClient && snapshotBlockNumber > cacheBlockNumber + 100; // Load from cache if the snapshot is less than 100 blocks newer than the cache

      if (syncFromSnapshot) {
        this.setLoadingState(SyncState.INITIAL, "Fetching initial state from snapshot", 50);
        initialState = await fetchSnapshot(snapshotClient, worldContract.address, decode);
      } else {
        this.setLoadingState(SyncState.INITIAL, "Fetching initial state from cache", 50);
        initialState = await loadIndexDbCacheStore(indexDbCache);
      }

      console.log(`[SyncWorker] got ${initialState.state.size} items from ${syncFromSnapshot ? "snapshot" : "cache"}`);
    }

    // Load events from gap between initial state and current block number from RPC
    const streamStartBlockNumber = await streamStartBlockNumberPromise;
    this.setLoadingState(
      SyncState.INITIAL,
      `Fetching state from block ${initialState.blockNumber} to ${streamStartBlockNumber}`,
      80
    );
    const gapState = await fetchStateInBlockRange(fetchWorldEvents, initialState.blockNumber, streamStartBlockNumber);
    console.log(
      `[SyncWorker] got ${gapState.state.size} items from block range ${initialState.blockNumber} -> ${streamStartBlockNumber}`
    );

    // Merge initial state, gap state and live events since initial sync started
    cacheStore.current = mergeCacheStores([initialState, gapState, cacheStore.current]);
    console.log(`[SyncWorker] initial sync state size: ${cacheStore.current.state.size}`);

    this.setLoadingState(SyncState.INITIAL, `Initializing with ${cacheStore.current.state.size} state entries`, 90);

    // Pass current cacheStore to output and start passing live events
    for (const update of getCacheStoreEntries(cacheStore.current)) {
      this.output$.next(update as NetworkEvent<C>);
    }

    // Let the client know loading is complete
    this.setLoadingState(SyncState.LIVE, `Streaming live events`, 100, cacheStore.current.blockNumber);
    passLiveEventsToOutput = true;

    // Store the local cache to IndexDB once every 10 seconds
    // (indexDB writes take too long to write for every event)
    setInterval(() => saveCacheStoreToIndexDb(indexDbCache, cacheStore.current), 10000);
  }

  public work(input$: Observable<SyncWorkerConfig>): Observable<NetworkEvent<C>> {
    input$.subscribe(this.input$);
    return this.output$.asObservable();
  }
}
