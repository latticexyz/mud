/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonRpcProvider } from "@ethersproject/providers";
import { keccak256, sleep } from "@latticexyz/utils";
import { computed } from "mobx";
import { ack, Input, InputType, SyncWorker } from "./SyncWorker";
import { concatMap, from, map, Subject, Subscription, timer } from "rxjs";
import { isNetworkComponentUpdateEvent, NetworkComponentUpdate, NetworkEvents } from "../types";
import { Components, Entity } from "@latticexyz/recs";
import { createCacheStore, storeEvent } from "./CacheStore";
import "fake-indexeddb/auto";
import { SingletonID, SyncState } from "./constants";
import * as syncUtils from "../v2/syncUtils";
import { createLatestEventStreamRPC } from "../v2/syncUtils";

// Test constants
const cacheBlockNumber = 99;
const cacheEvent = {
  type: NetworkEvents.NetworkComponentUpdate,
  component: "0x10",
  entity: "0x11" as Entity,
  key: { key: "0x11" },
  value: {},
  txHash: "0x12",
  lastEventInTx: true,
  blockNumber: cacheBlockNumber + 1,
  namespace: "namespace",
  table: "table",
} as NetworkComponentUpdate;
const blockNumber$ = new Subject<number>();
const latestEvent$ = new Subject<NetworkComponentUpdate>();
const lastGapStateEventBlockNumber = 999;
const gapStateEvents = [
  {
    type: NetworkEvents.NetworkComponentUpdate,
    component: "0x20",
    entity: "0x21" as Entity,
    key: { key: "0x21" },
    value: {},
    txHash: "0x22",
    lastEventInTx: true,
    blockNumber: lastGapStateEventBlockNumber,
    namespace: "namespace",
    table: "table2",
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

jest.mock("../v2/syncUtils", () => ({
  ...jest.requireActual("../v2/syncUtils"),
  createFetchWorldEventsInBlockRange: () => () => Promise.resolve([]),
  createLatestEventStreamRPC: jest.fn(() => latestEvent$),
  createLatestEventStreamService: jest.fn(() => latestEvent$),
  fetchStateInBlockRange: jest.fn((fetchWorldEvents: any, boundFetchStoreEvents: any, from: number, to: number) => {
    const store = createCacheStore();
    if (to > 1000) {
      for (const event of gapStateEvents) storeEvent(store, event);
    }
    return store;
  }),
  fetchEventsInBlockRangeChunked: jest.fn(
    (fetchWorldEvents: any, boundFetchStoreEvents: any, from: number, to: number) => {
      if (to > 1000) {
        return gapStateEvents;
      }
      return [];
    }
  ),
}));

// Tests
describe("Sync.worker", () => {
  let input$: Subject<Input>;
  let output: jest.Mock;
  let subscription: Subscription;
  let ackSubscription: Subscription;
  let worker: SyncWorker<Components>;

  beforeEach(async () => {
    input$ = new Subject<Input>();
    worker = new SyncWorker();

    // "ack" stream
    ackSubscription = timer(0, 1)
      .pipe(map(() => ack))
      .subscribe(input$);

    output = jest.fn();
    subscription = worker
      .work(input$)
      .pipe(concatMap((updates) => from(updates)))
      .subscribe((e) => {
        if (isNetworkComponentUpdateEvent(e) && e.component !== keccak256("component.LoadingState")) {
          output(e);
        }
      });
  });

  afterEach(() => {
    subscription?.unsubscribe();
    ackSubscription?.unsubscribe();
    jest.clearAllMocks();
  });

  it.only("should report the current loading state via the `component.LoadingState` component", async () => {
    const freshOutput = jest.fn();
    const freshWorker = new SyncWorker();
    const freshInput$ = new Subject<Input>();

    const sub = (subscription = freshWorker.work(freshInput$).subscribe(freshOutput));

    freshInput$.next({
      type: InputType.Config,
      data: {
        snapshotServiceUrl: "",
        chainId: 4242,
        worldContract: { address: "0x00", abi: [] },
        provider: {
          jsonRpcUrl: "",
          options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true },
          chainId: 4242,
        },
        initialBlockNumber: 0,
      },
    });

    const finalUpdate: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: keccak256("component.LoadingState"),
      value: { state: SyncState.LIVE, msg: "Streaming live events", percentage: 100 },
      entity: SingletonID,
      key: {},
      txHash: "worker",
      lastEventInTx: false,
      blockNumber: 99,
      namespace: "mudsync",
      table: "LoadingState",
    };

    await sleep(0);
    blockNumber$.next(101);
    await sleep(50);
    expect(freshOutput).toHaveBeenCalledWith(expect.arrayContaining([finalUpdate]));

    sub?.unsubscribe();
  });

  it("should pass live events to the output", async () => {
    input$.next({
      type: InputType.Config,
      data: {
        snapshotServiceUrl: "",
        streamServiceUrl: "",
        chainId: 4242,
        worldContract: { address: "0x00", abi: [] },
        provider: {
          jsonRpcUrl: "",
          options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true },
          chainId: 4242,
        },
        initialBlockNumber: 0,
      },
    });

    await sleep(0);
    blockNumber$.next(101);
    await sleep(0);

    const event: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x00",
      entity: "0x01" as Entity,
      key: { key: "0x01" },
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: 111,
      namespace: "namespace",
      table: "table",
    };

    latestEvent$.next(event);
    await sleep(50);

    // Expect output to contain live event
    expect(output).toHaveBeenCalledWith(event);
  });

  it("should sync live events from rpc if streaming service is not available", async () => {
    input$.next({
      type: InputType.Config,
      data: {
        snapshotServiceUrl: "",
        streamServiceUrl: "",
        chainId: 4242,
        worldContract: { address: "0x00", abi: [] },
        provider: {
          chainId: 4242,
          jsonRpcUrl: "",
          options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true },
        },
        initialBlockNumber: 0,
      },
    });
    await sleep(0);
    expect(createLatestEventStreamRPC).toHaveBeenCalled();
  });

  it("should sync from the cache if the snapshot service is not available", async () => {
    input$.next({
      type: InputType.Config,
      data: {
        snapshotServiceUrl: "",
        streamServiceUrl: "",
        chainId: 4242,
        worldContract: { address: "0x00", abi: [] },
        provider: {
          chainId: 4242,
          jsonRpcUrl: "",
          options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true },
        },
        initialBlockNumber: 0,
      },
    });

    await sleep(0);
    blockNumber$.next(101);
    await sleep(50);

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
      type: InputType.Config,
      data: {
        snapshotServiceUrl: "",
        streamServiceUrl: "",
        chainId: 4242,
        worldContract: { address: "0x00", abi: [] },
        provider: {
          chainId: 4242,
          jsonRpcUrl: "",
          options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true },
        },
        initialBlockNumber: 0,
      },
    });

    const currentBlockNumber = 1001;

    await sleep(0);
    blockNumber$.next(currentBlockNumber);
    await sleep(50);

    // Expect state between cache block number and current block number to have been fetched
    expect(syncUtils.fetchEventsInBlockRangeChunked).toHaveBeenLastCalledWith(
      expect.anything(),
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
      type: InputType.Config,
      data: {
        snapshotServiceUrl: "",
        streamServiceUrl: "",
        chainId: 4242,
        worldContract: { address: "0x00", abi: [] },
        provider: {
          chainId: 4242,
          jsonRpcUrl: "",
          options: { batch: false, pollingInterval: 1000, skipNetworkCheck: true },
        },
        initialBlockNumber: 0,
      },
    });
    input$.next(ack);

    const firstLiveBlockNumber = 1001;
    const secondLiveBlockNumber = 1002;

    const event1: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x99",
      entity: "0x01" as Entity,
      key: { key: "0x01" },
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: firstLiveBlockNumber,
      namespace: "namespace",
      table: "table",
    };

    const event2: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x0999",
      entity: "0x01" as Entity,
      key: { key: "0x00" },
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: secondLiveBlockNumber,
      namespace: "namespace",
      table: "table",
    };

    const event3: NetworkComponentUpdate = {
      type: NetworkEvents.NetworkComponentUpdate,
      component: "0x9999",
      entity: "0x01" as Entity,
      key: { key: "0x01" },
      value: {},
      txHash: "0x02",
      lastEventInTx: true,
      blockNumber: 1003,
      namespace: "namespace",
      table: "table",
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
    await sleep(50);

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
