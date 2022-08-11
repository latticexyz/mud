import { EntityID } from "@latticexyz/recs";
import { sleep } from "@latticexyz/utils";
import { Subject } from "rxjs";
import { NetworkComponentUpdate } from "../types";
import { getCacheStoreEntries } from "./CacheStore";
import { createLatestEventStream, createSnapshotClient, createWorldTopics, fetchStateInBlockRange } from "./syncUtils";

describe("syncUtils", () => {
  describe("createSnapshotClient", () => {
    it("should not error", () => {
      const snapshotClient = createSnapshotClient("http://localhost:50052");
      expect(snapshotClient).toBeDefined();
    });
  });

  describe("getSnapshotBlockNumber", () => {
    it.todo("end-to-end test");
  });

  describe("fetchSnapshot", () => {
    it.todo("end-to-end test");
  });

  describe("createLatestEventStream", () => {
    it("should fetch world events for new block range when a new block number arrives", async () => {
      const blockNumber$ = new Subject<number>();
      const event: NetworkComponentUpdate = {
        component: "0x1",
        entity: "0x0" as EntityID,
        value: {},
        lastEventInTx: true,
        txHash: "0x2",
        blockNumber: 1,
      };

      const fetchWorldEvents = jest.fn(() => Promise.resolve([event, event]));
      const latestEvent = jest.fn();

      createLatestEventStream(blockNumber$, fetchWorldEvents).subscribe(latestEvent);

      expect(fetchWorldEvents).not.toHaveBeenCalled();

      blockNumber$.next(1);
      expect(fetchWorldEvents).toHaveBeenCalledTimes(1);
      expect(fetchWorldEvents).toHaveBeenLastCalledWith(1, 1);

      blockNumber$.next(2);
      expect(fetchWorldEvents).toHaveBeenCalledTimes(2);
      expect(fetchWorldEvents).toHaveBeenLastCalledWith(2, 2);

      blockNumber$.next(5);
      expect(fetchWorldEvents).toHaveBeenCalledTimes(3);
      expect(fetchWorldEvents).toHaveBeenLastCalledWith(3, 5);

      blockNumber$.next(1);
      expect(fetchWorldEvents).toHaveBeenCalledTimes(4);
      expect(fetchWorldEvents).toHaveBeenLastCalledWith(1, 1);

      await sleep(0);
      expect(latestEvent).toHaveBeenCalledTimes(8);
      expect(latestEvent).toHaveBeenLastCalledWith(event);
    });
  });

  describe("fetchStateInBlockRange", () => {
    it("should fetch world events in the given range with the given interval", async () => {
      const event: NetworkComponentUpdate = {
        component: "0x1",
        entity: "0x0" as EntityID,
        value: {},
        lastEventInTx: true,
        txHash: "0x2",
        blockNumber: 4242,
      };

      const fetchWorldEvents = jest.fn(() => Promise.resolve([event, event]));

      const state = await fetchStateInBlockRange(fetchWorldEvents, 42, 6969, 100);

      expect(fetchWorldEvents).toHaveBeenCalledTimes(Math.ceil((6969 - 42) / 100));
      expect(fetchWorldEvents).toHaveBeenCalledWith(42, 141);
      expect(fetchWorldEvents).toHaveBeenCalledWith(142, 241);
      // ...
      expect(fetchWorldEvents).toHaveBeenCalledWith(6942, 6969);
      expect(state.blockNumber).toBe(4241);
      expect([...getCacheStoreEntries(state)]).toEqual([
        {
          component: "0x1",
          entity: "0x0" as EntityID,
          value: {},
          lastEventInTx: false,
          txHash: "cache",
          blockNumber: 4241,
        },
      ]);
    });
  });

  describe("createDecode", () => {
    it.todo("end-to-end test");
  });

  describe("createWorldTopics", () => {
    it("should return World event topics", () => {
      const worldTopics = createWorldTopics();
      expect(worldTopics).toEqual([
        {
          key: "World",
          topics: [
            [
              "0x6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a6073",
              "0x6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b350",
            ],
          ],
        },
      ]);
    });
  });

  describe("createFetchWorldEventsInBlockRange", () => {
    it.todo("end-to-end test");
  });
});
