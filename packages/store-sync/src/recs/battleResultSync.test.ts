/* eslint-disable max-len */
import { describe, expect, it } from "vitest";
import { recsStorage } from "./recsStorage";
import { Entity, createWorld, getComponentValueStrict } from "@latticexyz/recs";
import mudConfig from "../../../../e2e/packages/contracts/mud.config";
import worldRpcLogs from "../../../../test-data/world-logs-battle.json";
import { resolveConfig } from "@latticexyz/store";
import { logsToBlocks } from "../../test/logsToBlocks";
import { SNAPSHOT } from "./snapshot";

const config = resolveConfig(mudConfig);

const blocks = logsToBlocks(worldRpcLogs);

describe("sync BattleResult table`", () => {
  it("doesn't print warning", async () => {
    const world = createWorld();
    const { storageAdapter, components } = recsStorage({ world, tables: config.tables });

    for (const block of blocks) {
      await storageAdapter(block);
    }

    const value = getComponentValueStrict(
      components.BattleResult,
      "0x94a20d7cecba2a0266a9f899622dd00d801b15bd7640739b3f708d7429cd4506" as Entity,
    );

    delete value.__dynamicData;
    delete value.__encodedLengths;
    delete value.__staticData;

    expect(value).toMatchInlineSnapshot(SNAPSHOT);
  });
});
