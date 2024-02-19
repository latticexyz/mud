import { describe, expect, it } from "vitest";
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../test-data/world-logs-skystrife.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog } from "../common";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { resolveConfig, storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStore } from "./createStore";

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

describe("createStorageAdapter", () => {
  it("sets component values from logs", async () => {
    const useStore = createStore({ tables });
    const storageAdapter = createStorageAdapter({ store: useStore });

    for (const block of blocks) {
      await storageAdapter(block);
    }
  });
});
