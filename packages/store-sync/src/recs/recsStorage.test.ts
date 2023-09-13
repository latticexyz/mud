import { describe, expect, it } from "vitest";
import { blockLogsToStorage } from "../blockLogsToStorage";
import { recsStorage } from "./recsStorage";
import { createWorld, getComponentEntities, getComponentValue } from "@latticexyz/recs";
// TODO: figure out if this needs to be imported from a package rather than relative path
// TODO: if relative imports are fine, probably should put the e2e test data with its mud config?
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../test-data/world-logs.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog } from "../common";
import { singletonEntity } from "./singletonEntity";
import { RpcLog, formatLog, decodeEventLog, Hex } from "viem";
import { storeEventsAbi } from "@latticexyz/store";

const worldLogs = worldRpcLogs.map((log) => {
  const { eventName, args } = decodeEventLog({
    abi: storeEventsAbi,
    data: log.data as Hex,
    topics: log.topics as [Hex, ...Hex[]],
    strict: true,
  });
  return formatLog(log as any as RpcLog, { args, eventName: eventName as string }) as StoreEventsLog;
});

describe("recsStorage", () => {
  it("creates components", async () => {
    const world = createWorld();
    const { components } = recsStorage({ world, config: mudConfig });
    expect(components.NumberList.id).toMatchInlineSnapshot(
      '"0x000000000000000000000000000000004e756d6265724c697374000000000000"'
    );
  });

  it("sets component values from logs", async () => {
    const world = createWorld();
    const { storageAdapter, components } = recsStorage({ world, config: mudConfig });

    const blocks = groupLogsByBlockNumber(worldLogs);
    await Promise.all(blocks.map(async (block) => await blockLogsToStorage(storageAdapter)(block)));

    expect(Array.from(getComponentEntities(components.NumberList))).toMatchInlineSnapshot(`
      [
        "0x",
      ]
    `);

    expect(getComponentValue(components.NumberList, singletonEntity)).toMatchInlineSnapshot(`
      {
        "value": [
          420,
          69,
        ],
      }
    `);
  });
});
