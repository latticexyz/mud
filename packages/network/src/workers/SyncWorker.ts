import { awaitStreamValue, DoWork, streamToDefinedComputed } from "@latticexyz/utils";
import { Observable, Subject } from "rxjs";
import { NetworkComponentUpdate, SyncWorkerConfig } from "../types";
import { Components } from "@latticexyz/recs";
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
} from "./syncUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
export type Output<Cm extends Components> = NetworkComponentUpdate<Cm>;

export class SyncWorker<Cm extends Components> implements DoWork<SyncWorkerConfig<Cm>, Output<Cm>> {
  private input$ = new Subject<SyncWorkerConfig<Cm>>();
  private output$ = new Subject<Output<Cm>>();

  constructor() {
    this.init();
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
    // Turn config into variable accessible outside the stream
    const computedConfig = await streamToDefinedComputed(this.input$);
    const {
      checkpointServiceUrl,
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

    // Start syncing current events, but only start streaming to output once gap between initial state and current block is closed
    console.log("[SyncWorker] start initial sync");
    let passLiveEventsToOutput = false;
    const cacheStore = { current: createCacheStore() };
    const { blockNumber$ } = createBlockNumberStream(providers);
    createLatestEventStream(blockNumber$, fetchWorldEvents).subscribe((event) => {
      storeEvent(cacheStore.current, event);
      if (passLiveEventsToOutput) this.output$.next(event as Output<Cm>);
    });
    const streamStartBlockNumber = awaitStreamValue(blockNumber$);

    // Load initial state from cache or snapshot service
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
      initialState = syncFromSnapshot
        ? await fetchSnapshot(snapshotClient, worldContract.address, decode)
        : await loadIndexDbCacheStore(indexDbCache);
      console.log(`[SyncWorker] got ${initialState.state.size} items from ${syncFromSnapshot ? "snapshot" : "cache"}`);
    }

    // Load events from gap between initial state and current block number from RPC
    const gapState = await fetchStateInBlockRange(
      fetchWorldEvents,
      initialState.blockNumber || initialBlockNumber,
      await streamStartBlockNumber
    );
    console.log(
      `[SyncWorker] got ${gapState.state.size} items from block range ${
        initialState.blockNumber
      } -> ${await streamStartBlockNumber}`
    );

    // Merge initial state, gap state and live events since initial sync started
    cacheStore.current = mergeCacheStores([initialState, gapState, cacheStore.current]);
    console.log(`[SyncWorker] initial sync state size: ${cacheStore.current.state.size}`);

    // Pass current cacheStore to output and start passing live events
    for (const update of getCacheStoreEntries(cacheStore.current)) {
      this.output$.next(update as Output<Cm>);
    }
    passLiveEventsToOutput = true;

    // Store the local cache to IndexDB once every 10 seconds
    // (indexDB writes take too long to write for every event)
    setInterval(() => saveCacheStoreToIndexDb(indexDbCache, cacheStore.current), 10000);
  }

  public work(input$: Observable<SyncWorkerConfig<Cm>>): Observable<Output<Cm>> {
    input$.subscribe(this.input$);
    return this.output$.asObservable();
  }
}
