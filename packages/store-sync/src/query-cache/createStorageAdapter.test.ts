import { beforeAll, describe, expect, it } from "vitest";
import { storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStore } from "./createStore";
import { configV2 as config, deployMockGame } from "../../test/mockGame";
import { fetchAndStoreLogs } from "../fetchAndStoreLogs";
import { testClient } from "../../test/common";
import { getBlockNumber } from "viem/actions";
import { Address } from "viem";

describe("createStorageAdapter", async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let worldAddress: Address;
  beforeAll(async () => {
    worldAddress = await deployMockGame();
  });

  it("sets component values from logs", async () => {
    const useStore = createStore({ tables: Object.values(config.tables) });
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

    expect(useStore.getState().records.map((record) => record.fields)).toMatchInlineSnapshot();
  });
});
