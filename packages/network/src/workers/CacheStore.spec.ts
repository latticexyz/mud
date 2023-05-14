import { Entity } from "@latticexyz/recs";
import { packTuple } from "@latticexyz/utils";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import {
  createCacheStore,
  getCacheStoreEntries,
  getIndexDbECSCache,
  loadIndexDbCacheStore,
  mergeCacheStores,
  saveCacheStoreToIndexDb,
  storeEvent,
} from "./CacheStore";

import "fake-indexeddb/auto";

describe("CacheStore", () => {
  describe("createCacheStore", () => {
    it("should return a new cache store object", () => {
      const cacheStore = createCacheStore();
      expect(cacheStore.components.length).toBe(0);
      expect(cacheStore.entities.length).toBe(0);
      expect(cacheStore.componentToIndex.size).toBe(0);
      expect(cacheStore.entityToIndex.size).toBe(0);
      expect(cacheStore.state.size).toBe(0);
      expect(cacheStore.blockNumber).toBe(0);
    });
  });

  describe("storeEvent", () => {
    it("should store events to the cacheStore", () => {
      const event: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 1, y: 2 },
        lastEventInTx: false,
        blockNumber: 1,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      const cacheStore = createCacheStore();
      storeEvent(cacheStore, event);

      expect(cacheStore.components).toEqual(["Position"]);
      expect(cacheStore.entities).toEqual(["0x00"]);
      expect(cacheStore.componentToIndex.get("Position")).toBe(0);
      expect(cacheStore.entityToIndex.get("0x00")).toBe(0);
      expect(cacheStore.state.size).toBe(1);
      expect(cacheStore.blockNumber).toBe(0);
      expect([...cacheStore.state.entries()]).toEqual([[packTuple([0, 0]), { x: 1, y: 2 }]]);

      const event2: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x01" as Entity,
        key: { key: "0x01" },
        component: "Position",
        value: { x: 1, y: 2 },
        lastEventInTx: true,
        blockNumber: 1,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };
      storeEvent(cacheStore, event2);

      expect(cacheStore.components).toEqual(["Position"]);
      expect(cacheStore.entities).toEqual(["0x00", "0x01"]);
      expect(cacheStore.componentToIndex.get("Position")).toBe(0);
      expect(cacheStore.entityToIndex.get("0x00")).toBe(0);
      expect(cacheStore.entityToIndex.get("0x01")).toBe(1);
      expect(cacheStore.state.size).toBe(2);
      expect(cacheStore.blockNumber).toBe(0);
      expect([...cacheStore.state.entries()]).toEqual([
        [packTuple([0, 0]), { x: 1, y: 2 }],
        [packTuple([0, 1]), { x: 1, y: 2 }],
      ]);
    });

    it("should normalize hex entity ids to the same padding", () => {
      const event1: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00000000000000000000000001" as Entity,
        key: { key: "0x00000000000000000000000001" },
        component: "Position",
        value: { x: 1, y: 2 },
        lastEventInTx: true,
        blockNumber: 1,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      const event2: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x0001" as Entity,
        key: { key: "0x0001" },
        component: "Position",
        value: { x: 1, y: 3 },
        lastEventInTx: true,
        blockNumber: 1,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      const cacheStore = createCacheStore();
      storeEvent(cacheStore, event1);
      storeEvent(cacheStore, event2);

      const events = [...getCacheStoreEntries(cacheStore)];
      expect(events.length).toBe(1);
      expect(events[0]).toEqual({
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x01" as Entity,
        key: { key: "0x01" },
        component: "Position",
        value: { x: 1, y: 3 },
        lastEventInTx: false,
        blockNumber: 0,
        txHash: "cache",
        namespace: "namespace",
        table: "table",
      });
    });

    it("should set block number to one less than the last received event", () => {
      const event: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 1, y: 2 },
        lastEventInTx: false,
        blockNumber: 1,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      const cacheStore = createCacheStore();
      storeEvent(cacheStore, event);
      expect(cacheStore.blockNumber).toBe(0);

      storeEvent(cacheStore, { ...event, blockNumber: 2 });
      expect(cacheStore.blockNumber).toBe(1);
    });
  });

  describe("getCacheStoreEntries", () => {
    it("should return an interator of NetworkComponentUpdates representing the current state", () => {
      const cacheStore = createCacheStore();

      const event: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 1, y: 2 },
        lastEventInTx: false,
        blockNumber: 1,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      storeEvent(cacheStore, event);

      expect([...getCacheStoreEntries(cacheStore)]).toEqual([
        {
          type: NetworkEvents.NetworkComponentUpdate,
          entity: "0x00",
          component: "Position",
          value: { x: 1, y: 2 },
          lastEventInTx: false,
          blockNumber: 0,
          txHash: "cache",
          namespace: "namespace",
          table: "table",
        },
      ]);

      const event2: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 2, y: 2 },
        lastEventInTx: false,
        blockNumber: 2,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      storeEvent(cacheStore, event2);

      expect([...getCacheStoreEntries(cacheStore)]).toEqual([
        {
          type: NetworkEvents.NetworkComponentUpdate,
          entity: "0x00",
          component: "Position",
          value: { x: 2, y: 2 },
          lastEventInTx: false,
          blockNumber: 1,
          txHash: "cache",
          namespace: "namespace",
          table: "table",
        },
      ]);

      const event3: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x01" as Entity,
        key: { key: "0x01" },
        component: "Position",
        value: { x: -1, y: 2 },
        lastEventInTx: false,
        blockNumber: 3,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      storeEvent(cacheStore, event3);

      expect([...getCacheStoreEntries(cacheStore)]).toEqual([
        {
          type: NetworkEvents.NetworkComponentUpdate,
          entity: "0x00",
          component: "Position",
          value: { x: 2, y: 2 },
          lastEventInTx: false,
          blockNumber: 2,
          txHash: "cache",
          namespace: "namespace",
          table: "table",
        },
        {
          type: NetworkEvents.NetworkComponentUpdate,
          entity: "0x01",
          component: "Position",
          value: { x: -1, y: 2 },
          lastEventInTx: false,
          blockNumber: 2,
          txHash: "cache",
          namespace: "namespace",
          table: "table",
        },
      ]);
    });
  });

  describe("mergeCacheStores", () => {
    it("should return a new cache store including the state of all input cache stores", () => {
      const cacheStore1 = createCacheStore();
      const cacheStore2 = createCacheStore();

      const event1: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 1, y: 2 },
        lastEventInTx: false,
        blockNumber: 1,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      const event2: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x01" as Entity,
        key: { key: "0x01" },
        component: "Health",
        value: { value: 1 },
        lastEventInTx: false,
        blockNumber: 2,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      storeEvent(cacheStore1, event1);
      storeEvent(cacheStore1, event2);

      const event3: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 3, y: 2 },
        lastEventInTx: false,
        blockNumber: 3,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      const event4: NetworkComponentUpdate = {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Speed",
        value: { value: 10 },
        lastEventInTx: true,
        blockNumber: 4,
        txHash: "",
        namespace: "namespace",
        table: "table",
      };

      storeEvent(cacheStore2, event3);
      storeEvent(cacheStore2, event4);

      const mergedCacheStore = mergeCacheStores([cacheStore1, cacheStore2]);

      const entries = [...getCacheStoreEntries(mergedCacheStore)];

      expect(entries).toEqual([
        {
          type: NetworkEvents.NetworkComponentUpdate,
          entity: "0x00",
          component: "Position",
          value: { x: 3, y: 2 },
          lastEventInTx: false,
          blockNumber: 3,
          txHash: "cache",
          namespace: "namespace",
          table: "table",
        },
        {
          type: NetworkEvents.NetworkComponentUpdate,
          entity: "0x01",
          component: "Health",
          value: { value: 1 },
          lastEventInTx: false,
          blockNumber: 3,
          txHash: "cache",
          namespace: "namespace",
          table: "table",
        },
        {
          type: NetworkEvents.NetworkComponentUpdate,
          entity: "0x00",
          component: "Speed",
          value: { value: 10 },
          lastEventInTx: false,
          blockNumber: 3,
          txHash: "cache",
          namespace: "namespace",
          table: "table",
        },
      ]);
    });
  });

  describe("indexDB", () => {
    it("should store and load a cacheStore to/from indexDB", async () => {
      const cache = await getIndexDbECSCache(4242, "0x0", 1, indexedDB);

      const cacheStore = createCacheStore();

      storeEvent(cacheStore, {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 1, y: 2 },
        blockNumber: 1,
        namespace: "namespace",
        table: "table",
      });

      storeEvent(cacheStore, {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x01" as Entity,
        key: { key: "0x01" },
        component: "Health",
        value: { value: 1 },
        blockNumber: 2,
        namespace: "namespace",
        table: "table",
      });

      storeEvent(cacheStore, {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Position",
        value: { x: 3, y: 2 },
        blockNumber: 3,
        namespace: "namespace",
        table: "table",
      });

      storeEvent(cacheStore, {
        type: NetworkEvents.NetworkComponentUpdate,
        entity: "0x00" as Entity,
        key: { key: "0x00" },
        component: "Speed",
        value: { value: 10 },
        blockNumber: 4,
        namespace: "namespace",
        table: "table",
      });

      await saveCacheStoreToIndexDb(cache, cacheStore);
      const loadedCacheStore = await loadIndexDbCacheStore(cache);

      expect([...getCacheStoreEntries(loadedCacheStore)]).toEqual([...getCacheStoreEntries(cacheStore)]);
    });
  });
});
