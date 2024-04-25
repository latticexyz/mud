import { beforeAll, describe, expect, it } from "vitest";
import { storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStore } from "./createStore";
import { configV2 as config, deployMockGame } from "../../test/mockGame";
import { fetchAndStoreLogs } from "../fetchAndStoreLogs";
import { testClient } from "../../test/common";
import { getBlockNumber } from "viem/actions";
import { Address } from "viem";

describe.skip("createStorageAdapter", async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let worldAddress: Address;
  beforeAll(async () => {
    worldAddress = await deployMockGame();
  });

  it("sets component values from logs", async () => {
    const useStore = createStore({ tables: config.tables });
    const storageAdapter = createStorageAdapter({ store: useStore });

    console.log("fetching blocks");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const block of fetchAndStoreLogs({
      storageAdapter,
      publicClient: testClient,
      events: storeEventsAbi,
      fromBlock: 0n,
      toBlock: await getBlockNumber(testClient),
    })) {
      // console.log("got block", block.blockNumber);
    }

    expect(useStore.getState().records.map((record) => record.fields)).toMatchInlineSnapshot(`
      [
        {
          "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          "x": 1,
          "y": -1,
        },
        {
          "health": 5n,
          "player": "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
        },
        {
          "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          "x": 3,
          "y": 5,
        },
        {
          "health": 5n,
          "player": "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
        },
        {
          "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          "x": 3,
          "y": 5,
        },
        {
          "health": 0n,
          "player": "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
        },
        {
          "player": "0xdBa86119a787422C593ceF119E40887f396024E2",
          "x": 100,
          "y": 100,
        },
        {
          "terrainType": 2,
          "x": 3,
          "y": 5,
        },
      ]
    `);
  });
});
