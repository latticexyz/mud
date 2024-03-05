import { storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "../../zustand/createStorageAdapter";
import { ZustandStore, createStore } from "../../zustand/createStore";
import { config } from "../../../test/mockGame";
import { fetchAndStoreLogs } from "../../fetchAndStoreLogs";
import { publicClient } from "../../../test/common";
import { storeTables, worldTables } from "../../common";
import { AllTables } from "../common";
import { Address } from "viem";

export const tables = {
  ...config.tables,
  ...storeTables,
  ...worldTables,
} as unknown as AllTables<typeof config>;

export async function createHydratedStore(worldAddress: Address): Promise<{
  store: ZustandStore<typeof tables>;
  fetchLatestLogs: () => Promise<void>;
}> {
  const store = createStore<typeof tables>({ tables });
  const storageAdapter = createStorageAdapter({ store });

  let latestBlock = -1n;
  async function fetchLatestLogs(): Promise<void> {
    const fromBlock = latestBlock + 1n;
    const toBlock = await publicClient.getBlockNumber();
    if (toBlock <= fromBlock) return;
    console.log("fetching blocks", fromBlock, "to", toBlock);
    for await (const block of fetchAndStoreLogs({
      storageAdapter,
      publicClient,
      address: worldAddress,
      events: storeEventsAbi,
      fromBlock,
      toBlock,
    })) {
      console.log("got block logs", block.blockNumber, block.logs.length);
    }
    latestBlock = toBlock;
  }

  await fetchLatestLogs();

  return { store, fetchLatestLogs };
}
