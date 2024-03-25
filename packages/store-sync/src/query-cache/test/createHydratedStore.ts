import { storeEventsAbi } from "@latticexyz/store";
import { configV2 as config } from "../../../test/mockGame";
import { fetchAndStoreLogs } from "../../fetchAndStoreLogs";
import { testClient } from "../../../test/common";
import { Address } from "viem";
import { getBlock, getBlockNumber } from "viem/actions";
import { QueryCacheStore, createStore } from "../createStore";
import { createStorageAdapter } from "../createStorageAdapter";

export { config };

export async function createHydratedStore(worldAddress: Address): Promise<{
  store: QueryCacheStore<(typeof config)["tables"]>;
  fetchLatestLogs: () => Promise<bigint>;
}> {
  const store = createStore({ tables: config.tables });
  const storageAdapter = createStorageAdapter({ store });

  let lastBlockProcessed = (await getBlock(testClient, { blockTag: "earliest" })).number - 1n;
  async function fetchLatestLogs(): Promise<bigint> {
    const toBlock = await getBlockNumber(testClient);
    if (toBlock > lastBlockProcessed) {
      const fromBlock = lastBlockProcessed + 1n;
      // console.log("fetching blocks", fromBlock, "to", toBlock);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const block of fetchAndStoreLogs({
        storageAdapter,
        publicClient: testClient,
        address: worldAddress,
        events: storeEventsAbi,
        fromBlock,
        toBlock,
      })) {
        // console.log("got block logs", block.blockNumber, block.logs.length);
      }
      lastBlockProcessed = toBlock;
    }
    return toBlock;
  }

  await fetchLatestLogs();

  return { store, fetchLatestLogs };
}
