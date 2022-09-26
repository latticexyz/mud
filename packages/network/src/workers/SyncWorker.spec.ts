import { JsonRpcProvider } from "@ethersproject/providers";
import { keccak256, sleep } from "@latticexyz/utils";
import { computed } from "mobx";
import { SyncWorker } from "./SyncWorker";
import { Subject, Subscription } from "rxjs";
import { isNetworkComponentUpdateEvent, NetworkComponentUpdate, NetworkEvents, SyncWorkerConfig } from "../types";
import { Components, EntityID } from "@latticexyz/recs";
import { createCacheStore, storeEvent } from "./CacheStore";
import * as syncUtils from "./syncUtils";
import "fake-indexeddb/auto";
import { GodID, SyncState } from "./constants";
import { createLatestEventStreamRPC, createLatestEventStreamService } from "./syncUtils";

// Test constants
const cacheBlockNumber = 99;
const cacheEvent = {
  type: NetworkEvents.NetworkComponentUpdate,
  component: "0x10",
  entity: "0x11" as EntityID,
  value: {},
  txHash: "0x12",
  lastEventInTx: true,
  blockNumber: cacheBlockNumber + 1,
} as NetworkComponentUpdate;
const snapshotBlockNumber = 9999;
const snapshotEvents = [
  {
    type: NetworkEvents.NetworkComponentUpdate,
    component: "0x42",
    entity: "0x11" as EntityID,
    value: {},
    txHash: "0x12",
    lastEventInTx: true,
    blockNumber: snapshotBlockNumber + 1,
  },
] as NetworkComponentUpdate[];
const blockNumber$ = new Subject<number>();
const latestEvent$ = new Subject<NetworkComponentUpdate>();
const lastGapStateEventBlockNumber = 999;
const gapStateEvents = [
  {
    type: NetworkEvents.NetworkComponentUpdate,
    component: "0x20",
    entity: "0x21" as EntityID,
    value: {},
    txHash: "0x22",
    lastEventInTx: true,
    blockNumber: lastGapStateEventBlockNumber,
  },
] as NetworkComponentUpdate[];

// Mocks
jest.mock("../createProvider", () => ({
  ...jest.requireActual("../createProvider"),
  createReconnectingProvider: () => ({
    providers: computed(() => ({
      json: new JsonRpcProvider(""),
    })),
  }),
}));

jest.mock("./CacheStore", () => ({
  ...jest.requireActual("./CacheStore"),
  getIndexDbECSCache: () => ({
    get: (store: string, key: string) => {
      if (store === "BlockNumber" && key === "current") return cacheBlockNumber;
    },
  }),
  loadIndexDbCacheStore: () => {
    const cache = createCacheStore();

    storeEvent(cache, cacheEvent);

    return cache;
  },
  saveCacheStoreToIndexDb: jest.fn(),
}));

jest.mock("../createBlockNumberStream", () => ({
  ...jest.requireActual("../createBlockNumberStream"),
  createBlockNumberStream: () => ({ blockNumber$ }),
}));

jest.mock("./syncUtils", () => ({
  ...jest.requireActual("./syncUtils"),
  createFetchWorldEventsInBlockRange: () => () => Promise.resolve([]),
  createLatestEventStreamRPC: jest.fn(() => latestEvent$),
  createLatestEventStreamService: jest.fn(() => latestEvent$),
  getSnapshotBlockNumber: () => Promise.resolve(snapshotBlockNumber),
  fetchSnapshotChunked: () => {
    const store = createCacheStore();
    for (const event of snapshotEvents) storeEvent(store, event);
    return store;
  },
  fetchStateInBlockRange: jest.fn((fetchWorldEvents: any, from: number, to: number) => {
    const store = createCacheStore();
    if (to > 1000) {
      for (const event of gapStateEvents) storeEvent(store, event);
    }
    return store;
  }),
  fetchEventsInBlockRangeChunked: jest.fn((fetchWorldEvents: any, from: number, to: number) => {
    if (to > 1000) {
      return gapStateEvents;
    }
    return [];
  }),
}));

// Tests
describe("Sync.worker", () => {
  let input$: Subject<SyncWorkerConfig>;
  let output: jest.Mock;
  let subscription: Subscription;
  let worker: SyncWorker<Components>;

  beforeEach(async () => {
    input$ = new Subject<SyncWorkerConfig>();
    worker = new SyncWorker();

    output = jest.fn();
    subscription = worker.work(input$).subscribe((e) => {
      if (isNetworkComponentUpdateEvent(e) && e.component !== keccak256("component.LoadingState")) {
        console.log("Called with", e);
        output(e);
      }
    });
  });

  afterEach(() => {
    subscription?.unsubscribe();
    jest.clearAllMocks();
  });

  it("should report the current loading state via the `component.LoadingState` component", async () => {
    const freshOutput = jest.fn();
    const freshWorker = new SyncWorker();
    const freshInput$ = new Subject<SyncWorkerConfig>();

    const sub = (subscription = freshWorker.work(freshInput$).subscribe(freshOutput));

    freshInput$.next({
      checkpointServiceUrl: "",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });

    const finalUpdate: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: keccak256("component.LoadingState"),
      value: { state: SyncState.LIVE, msg: "Streaming live events", percentage: 100 },
      entity: GodID,
      txHash: "worker",
      lastEventInTx: false,
      blockNumber: 99,
    };

    await sleep(0);
    blockNumber$.next(101);
    await sleep(0);
    expect(freshOutput).toHaveBeenCalledWith(finalUpdate);

    sub?.unsubscribe();
  });

  it("should pass live events to the output", async () => {
    input$.next({
      checkpointServiceUrl: "",
      streamServiceUrl: "",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });

    await sleep(0);
    blockNumber$.next(101);
    await sleep(0);

    const event: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x00",
      entity: "0x01" as EntityID,
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: 111,
    };

    latestEvent$.next(event);

    // Expect output to contain live event
    expect(output).toHaveBeenCalledWith(event);
  });

  it("should sync live events from rpc if streaming service is not available", async () => {
    input$.next({
      checkpointServiceUrl: "",
      streamServiceUrl: "",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });
    await sleep(0);
    expect(createLatestEventStreamRPC).toHaveBeenCalled();
    expect(createLatestEventStreamService).not.toHaveBeenCalled();
  });

  it("should sync live events from streaming service if streaming service is available", async () => {
    input$.next({
      checkpointServiceUrl: "",
      streamServiceUrl: "http://localhost:50052",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });
    await sleep(0);
    expect(createLatestEventStreamRPC).not.toHaveBeenCalled();
    expect(createLatestEventStreamService).toHaveBeenCalled();
  });

  it("should sync from the snapshot if the snapshot block number is more than 100 blocks newer than then cache", async () => {
    input$.next({
      checkpointServiceUrl: "http://localhost:50062",
      streamServiceUrl: "",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });

    await sleep(0);
    blockNumber$.next(101);
    await sleep(0);

    // Expect output to contain the events from the cache
    expect(output).toHaveBeenCalledTimes(1);
    expect(output).toHaveBeenCalledWith({
      ...snapshotEvents[0],
      blockNumber: snapshotBlockNumber,
      lastEventInTx: false,
      txHash: "cache",
    });
  });

  it("should sync from the cache if the snapshot service is not available", async () => {
    input$.next({
      checkpointServiceUrl: "",
      streamServiceUrl: "",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });

    await sleep(0);
    blockNumber$.next(101);
    await sleep(0);

    // Expect output to contain the events from the cache
    expect(output).toHaveBeenCalledTimes(1);
    expect(output).toHaveBeenCalledWith({
      ...cacheEvent,
      blockNumber: cacheBlockNumber,
      lastEventInTx: false,
      txHash: "cache",
    });
  });

  it("should fetch the state diff between cache/snapshot and current block number", async () => {
    input$.next({
      checkpointServiceUrl: "",
      streamServiceUrl: "",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });

    const currentBlockNumber = 1001;

    await sleep(0);
    blockNumber$.next(currentBlockNumber);
    await sleep(0);

    // Expect state between cache block number and current block number to have been fetched
    expect(syncUtils.fetchEventsInBlockRangeChunked).toHaveBeenLastCalledWith(
      expect.anything(),
      cacheBlockNumber,
      currentBlockNumber,
      expect.anything(),
      expect.anything()
    );

    // Expect output to contain the events from the the gap state
    expect(output).toHaveBeenCalledWith({
      ...gapStateEvents[0],
      blockNumber: lastGapStateEventBlockNumber - 1,
      lastEventInTx: false,
      txHash: "cache",
    });
  });

  it("should first load from cache, then fetch the state gap, then pass live events", async () => {
    input$.next({
      checkpointServiceUrl: "",
      streamServiceUrl: "",
      chainId: 4242,
      worldContract: { address: "0x00", abi: [] },
      provider: { jsonRpcUrl: "", options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true } },
      initialBlockNumber: 0,
    });

    const firstLiveBlockNumber = 1001;
    const secondLiveBlockNumber = 1002;

    const event1: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x99",
      entity: "0x01" as EntityID,
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: firstLiveBlockNumber,
    };

    const event2: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x0999",
      entity: "0x01" as EntityID,
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: secondLiveBlockNumber,
    };

    const event3: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x9999",
      entity: "0x01" as EntityID,
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: 1003,
    };

    await sleep(0);
    // Event 1 and 2 arrive while the initial sync is in progress
    latestEvent$.next(event1);
    blockNumber$.next(firstLiveBlockNumber);
    latestEvent$.next(event2);
    blockNumber$.next(secondLiveBlockNumber);
    await sleep(0);

    // Event 3 arrives after the initial sync
    latestEvent$.next(event3);

    // Expect output to contain all events (cache, gap state, live events)
    expect(output).toHaveBeenCalledTimes(5);

    // Expect output to contain cache events
    expect(output).toHaveBeenNthCalledWith(1, {
      ...cacheEvent,
      blockNumber: secondLiveBlockNumber - 1,
      lastEventInTx: false,
      txHash: "cache",
    });

    // Expect state between cache block number and current block number to have been fetched
    expect(syncUtils.fetchEventsInBlockRangeChunked).toHaveBeenLastCalledWith(
      expect.anything(),
      cacheBlockNumber,
      firstLiveBlockNumber,
      expect.anything(),
      expect.anything()
    );

    // Expect output to contain the events from the cache and the gap state
    expect(output).toHaveBeenNthCalledWith(2, {
      ...gapStateEvents[0],
      blockNumber: secondLiveBlockNumber - 1,
      lastEventInTx: false,
      txHash: "cache",
    });

    // Expect output to contain live events that arrived before the initial sync was complete
    expect(output).toHaveBeenNthCalledWith(3, { ...event1, lastEventInTx: false, txHash: "cache" });
    expect(output).toHaveBeenNthCalledWith(4, {
      ...event2,
      lastEventInTx: false,
      txHash: "cache",
      blockNumber: secondLiveBlockNumber - 1,
    });

    // Expect output to contain live events that arrived after the initial sync
    expect(output).toHaveBeenNthCalledWith(5, event3);
  });
});
