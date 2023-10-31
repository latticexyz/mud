import { describe, expect, it } from "vitest";
import { recsStorage } from "./recsStorage";
import { createWorld, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../test-data/world-logs.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog } from "../common";
import { singletonEntity } from "./singletonEntity";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { resolveConfig, storeEventsAbi } from "@latticexyz/store";

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

describe("recsStorage", () => {
  it("creates components", async () => {
    const world = createWorld();
    const { components } = recsStorage({ world, tables });
    expect(components.NumberList.id).toMatchInlineSnapshot(
      '"0x746200000000000000000000000000004e756d6265724c697374000000000000"'
    );
  });

  it("sets component values from logs", async () => {
    const world = createWorld();
    const { storageAdapter, components } = recsStorage({ world, tables });

    for (const block of blocks) {
      await storageAdapter(block);
    }

    expect(Array.from(getComponentEntities(components.NumberList))).toMatchInlineSnapshot(`
      [
        "0x",
      ]
    `);

    expect(getComponentValue(components.NumberList, singletonEntity)).toMatchInlineSnapshot(`
      {
        "__dynamicData": "0x000001a400000045",
        "__encodedLengths": "0x0000000000000000000000000000000000000000000000000800000000000008",
        "__staticData": undefined,
        "value": [
          420,
          69,
        ],
      }
    `);
  });
});
