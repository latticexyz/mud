import { bench, describe } from "vitest";
import mudConfig from "../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../test-data/world-logs.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog } from "./common";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { resolveConfig, storeEventsAbi } from "@latticexyz/store";

import { createWorld } from "@latticexyz/recs";
import { recsStorage } from "./recs";
import { createStorageAdapter } from "./zustand/createStorageAdapter";
import { createStore } from "./zustand/createStore";

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
    return formatLog(log as any as RpcLog, { args, eventName: eventName as string }) as StoreEventsLog;
  })
);

const world = createWorld();
const { storageAdapter: recsStorageAdapter } = recsStorage({ world, tables });

const useStore = createStore({ tables });
const zustandStorageAdapter = createStorageAdapter({ store: useStore });

describe("Storage Adapter", () => {
  bench("recs: `storageAdapter`", async () => {
    for (const block of blocks) {
      await recsStorageAdapter(block);
    }
  });

  bench("zustand: `storageAdapter`", async () => {
    for (const block of blocks) {
      await zustandStorageAdapter(block);
    }
  });
});
