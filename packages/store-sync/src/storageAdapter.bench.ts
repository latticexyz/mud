import { bench, describe } from "vitest";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { StoreEventsLog } from "../src/common";
import { recsStorageAdapter, sqliteStorageAdapter, zustandStorageAdapter } from "../test/utils";
import { generateTestData } from "./generateTestData";

const worldRpcLogs = await generateTestData();

// TODO: make test-data a proper package and export this
export const blocks = groupLogsByBlockNumber(
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

  bench("sqlite: `storageAdapter`", async () => {
    for (const block of blocks) {
      await sqliteStorageAdapter(block);
    }
  });
});
