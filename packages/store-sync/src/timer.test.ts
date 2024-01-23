import { describe, it } from "vitest";
import mudConfig from "../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../test-data/world-logs.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog } from "./common";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { resolveConfig, storeEventsAbi } from "@latticexyz/store";
import { recsStorage } from "./recs";
import { createWorld } from "@latticexyz/recs";
import { createStorageAdapter, createStore } from "./zustand";
import * as fs from "fs";

const tables = resolveConfig(mudConfig).tables;

// TODO: make test-data a proper package and export this
const blocks = groupLogsByBlockNumber(
  worldRpcLogs.map((log) => {
    const { eventName, args } = decodeEventLog({
      abi: storeEventsAbi,
      data: log.data as Hex,
      topics: log.topics as [Hex, ...Hex[]],
      strict: true,
    });
    return formatLog(log as unknown as RpcLog, { args, eventName: eventName as string }) as StoreEventsLog;
  })
);

describe("timer", () => {
  it("times recs", async () => {
    const world = createWorld();

    let t = process.hrtime();
    const { storageAdapter } = recsStorage({ world, tables });

    for (const block of blocks) {
      await storageAdapter(block);
    }
    t = process.hrtime(t);

    fs.writeFile("recs_storageAdapter.txt", t[1].toString(), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });

  it("times zustand", async () => {
    const useStore = createStore({ tables });

    let t = process.hrtime();
    const storageAdapter = createStorageAdapter({ store: useStore });
    for (const block of blocks) {
      await storageAdapter(block);
    }
    t = process.hrtime(t);
    console.log("createStorageAdapter: %d nanoseconds", t[1]);

    fs.writeFile("zustand_storageAdapter.txt", t[1].toString(), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
});
