import { storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "../../zustand/createStorageAdapter";
import { ZustandStore, createStore } from "../../zustand/createStore";
import { config, deprecatedConfig } from "../../../test/mockGame";
import { fetchAndStoreLogs } from "../../fetchAndStoreLogs";
import { testClient } from "../../../test/common";
import { storeTables, worldTables } from "../../common";
import { AllTables } from "../common";
import { Address } from "viem";
import { getBlock, getBlockNumber } from "viem/actions";

export const tables = {
  ...config.tables,
  ...storeTables,
  ...worldTables,
} as unknown as AllTables<typeof deprecatedConfig>;

export async function createHydratedStore(worldAddress: Address): Promise<{
  store: ZustandStore<typeof tables>;
  fetchLatestLogs: () => Promise<bigint>;
}> {
  const store = createStore<typeof tables>({ tables });
  const storageAdapter = createStorageAdapter({ store });

  let lastBlockProcessed = (await getBlock(testClient, { blockTag: "earliest" })).number - 1n;
  async function fetchLatestLogs(): Promise<bigint> {
    const toBlock = await getBlockNumber(testClient);
    if (toBlock > lastBlockProcessed) {
      const fromBlock = lastBlockProcessed + 1n;
      // console.log("fetching blocks", fromBlock, "to", toBlock);
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
