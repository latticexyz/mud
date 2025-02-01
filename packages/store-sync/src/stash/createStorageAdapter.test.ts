import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "./createStorageAdapter";
import { config, deployMockGame } from "../../../../test-setup/mockGame";
import { fetchAndStoreLogs } from "../fetchAndStoreLogs";
import { getBlockNumber } from "viem/actions";
import { createStash } from "@latticexyz/stash/internal";
import { createTestClient, snapshotAnvilState } from "with-anvil";

describe("createStorageAdapter", async () => {
  beforeAll(snapshotAnvilState);
  beforeEach(snapshotAnvilState);

  beforeAll(async () => {
    await deployMockGame();
  });

  it("sets component values from logs", async () => {
    const testClient = createTestClient();
    const stash = createStash(config);
    const storageAdapter = createStorageAdapter({ stash });

    console.log("fetching blocks");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const block of fetchAndStoreLogs({
      storageAdapter,
      publicClient: testClient,
      events: storeEventsAbi,
      fromBlock: 0n,
      toBlock: await getBlockNumber(testClient),
    })) {
      //
    }

    expect(stash.get().records).toMatchInlineSnapshot(`
      {
        "": {
          "Health": {
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb": {
              "health": 0n,
              "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
            },
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e": {
              "health": 5n,
              "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
            },
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6": {
              "health": 5n,
              "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
            },
          },
          "Inventory": {},
          "Position": {
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb": {
              "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
              "x": 3,
              "y": 5,
            },
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e": {
              "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
              "x": 1,
              "y": -1,
            },
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6": {
              "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
              "x": 3,
              "y": 5,
            },
            "0xdBa86119a787422C593ceF119E40887f396024E2": {
              "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
              "x": 100,
              "y": 100,
            },
          },
          "Score": {},
          "Terrain": {
            "3|5": {
              "terrainType": 2,
              "x": 3,
              "y": 5,
            },
          },
          "Winner": {},
        },
      }
    `);

    expect(stash.getRecord({ table: config.tables.Terrain, key: { x: 3, y: 5 } })).toMatchInlineSnapshot(`
      {
        "terrainType": 2,
        "x": 3,
        "y": 5,
      }
    `);
  });
});
