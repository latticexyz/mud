import { describe, expect, it } from "vitest";
import { blockLogsToStorage } from "../blockLogsToStorage";
import { recsStorage } from "./recsStorage";
import { createWorld, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import superjson from "superjson";
// TODO: figure out if this needs to be imported from a package rather than relative path
// TODO: if relative imports are fine, probably should put the e2e test data with its mud config?
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import testLogsJson from "../../../../test-data/world-logs.json";
import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsLog } from "../common";
import { singletonEntity } from "./singletonEntity";

const testLogs = superjson.deserialize<readonly StoreEventsLog[]>(testLogsJson as any);

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

    const blocks = groupLogsByBlockNumber(testLogs);
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
