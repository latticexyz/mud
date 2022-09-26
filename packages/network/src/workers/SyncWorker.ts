import { awaitStreamValue, DoWork, keccak256, streamToDefinedComputed } from "@latticexyz/utils";
import { Observable, Subject } from "rxjs";
import { NetworkComponentUpdate, SyncWorkerConfig } from "../types";
import { Components, ComponentValue, SchemaOf } from "@latticexyz/recs";
import {
  createCacheStore,
  getCacheStoreEntries,
  getIndexDBCacheStoreBlockNumber,
  getIndexDbECSCache,
  loadIndexDbCacheStore,
  saveCacheStoreToIndexDb,
  storeEvent,
  storeEvents,
} from "./CacheStore";
import { createReconnectingProvider } from "../createProvider";
import { computed } from "mobx";
import {
  createSnapshotClient,
  createDecode,
  createFetchWorldEventsInBlockRange,
  getSnapshotBlockNumber,
  fetchSnapshotChunked,
  createLatestEventStreamRPC,
  createLatestEventStreamService,
  createTransformWorldEventsFromStream,
  fetchEventsInBlockRangeChunked,
} from "./syncUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { GodID, SyncState } from "./constants";
export type Output<Cm extends Components> = NetworkComponentUpdate<Cm>;

export class SyncWorker<Cm extends Components> implements DoWork<SyncWorkerConfig, Output<Cm>> {
  private input$ = new Subject<SyncWorkerConfig>();
  private output$ = new Subject<Output<Cm>>();

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
    const update: Output<Cm> = {
      component: keccak256("component.LoadingState"),
      value: { state, msg, percentage } as unknown as ComponentValue<SchemaOf<Cm[keyof Cm]>>,
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
      streamServiceUrl,
      chainId,
      worldContract,
      provider: { options: providerOptions },
      initialBlockNumber,
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
    const transformWorldEvents = createTransformWorldEventsFromStream(decode);

    // Start syncing current events, but only start streaming to output once gap between initial state and current block is closed

    console.log("[SyncWorker] start initial sync");
    this.setLoadingState(SyncState.INITIAL, "Starting initial sync", 0);
    let passLiveEventsToOutput = false;
    const cacheStore = { current: createCacheStore() };
    const { blockNumber$ } = createBlockNumberStream(providers);
    const latestEvent$ = streamServiceUrl
      ? createLatestEventStreamService(streamServiceUrl, worldContract.address, transformWorldEvents)
      : createLatestEventStreamRPC(blockNumber$, fetchWorldEvents);
    const initialLiveEvents: NetworkComponentUpdate<Components>[] = [];

    latestEvent$.subscribe((event) => {
      // If initial sync is in progress, temporary store the events to apply later
      if (!passLiveEventsToOutput) return initialLiveEvents.push(event);

      // Store cache to indexdb every block
      if (event.blockNumber > cacheStore.current.blockNumber + 1)
        saveCacheStoreToIndexDb(indexDbCache, cacheStore.current);

      storeEvent(cacheStore.current, event);
      this.output$.next(event as Output<Cm>);
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
        initialState = await fetchSnapshotChunked(snapshotClient, worldContract.address, decode);
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

    const gapStateEvents = await fetchEventsInBlockRangeChunked(
      fetchWorldEvents,
      initialState.blockNumber,
      streamStartBlockNumber,
      50,
      this.setLoadingState.bind(this)
    );

    console.log(
      `[SyncWorker] got ${gapStateEvents.length} items from block range ${initialState.blockNumber} -> ${streamStartBlockNumber}`
    );

    // Merge initial state, gap state and live events since initial sync started
    storeEvents(initialState, [...gapStateEvents, ...initialLiveEvents]);
    cacheStore.current = initialState;
    console.log(`[SyncWorker] initial sync state size: ${cacheStore.current.state.size}`);

    this.setLoadingState(SyncState.INITIAL, `Initializing with ${cacheStore.current.state.size} state entries`, 90);

    // Pass current cacheStore to output and start passing live events
    for (const update of getCacheStoreEntries(cacheStore.current)) {
      this.output$.next(update as Output<Cm>);
    }

    // Save initial state to cache
    saveCacheStoreToIndexDb(indexDbCache, cacheStore.current);

    // Let the client know loading is complete
    this.setLoadingState(SyncState.LIVE, `Streaming live events`, 100, cacheStore.current.blockNumber);
    passLiveEventsToOutput = true;
  }

  public work(input$: Observable<SyncWorkerConfig>): Observable<Output<Cm>> {
    input$.subscribe(this.input$);
    return this.output$.asObservable();
  }
}
