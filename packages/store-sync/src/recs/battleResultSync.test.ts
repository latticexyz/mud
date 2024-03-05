/* eslint-disable max-len */
import { describe, expect, it } from "vitest";
import { recsStorage } from "./recsStorage";
import { Entity, createWorld, getComponentEntities, getComponentValue } from "@latticexyz/recs";
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../test-data/world-logs-battle.json";
import { resolveConfig } from "@latticexyz/store";
import { logsToBlocks } from "../../test/logsToBlocks";

const tables = resolveConfig(mudConfig).tables;

const blocks = logsToBlocks(worldRpcLogs);

describe("sync BattleResult table`", () => {
  it("doesn't print warning", async () => {
    const world = createWorld();
    const { storageAdapter, components } = recsStorage({ world, tables });

    for (const block of blocks) {
      await storageAdapter(block);
    }

    expect(Array.from(getComponentEntities(components.BattleResult))).toMatchInlineSnapshot(`
      [
        "0x94a20d7cecba2a0266a9f899622dd00d801b15bd7640739b3f708d7429cd4506",
      ]
    `);

    expect(
      getComponentValue(
        components.BattleResult,
        "0x94a20d7cecba2a0266a9f899622dd00d801b15bd7640739b3f708d7429cd4506" as Entity,
      )?.aggressorAllies,
    ).toMatchInlineSnapshot(`
    [
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000014",
      "0x000000000000000000000000000000000000000000000000000000000000000f",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ]
    `);

    expect(
      getComponentValue(
        components.BattleResult,
        "0x94a20d7cecba2a0266a9f899622dd00d801b15bd7640739b3f708d7429cd4506" as Entity,
      )?.targetAllies,
    ).toMatchInlineSnapshot(`
    [
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ]
    `);
  });
});
