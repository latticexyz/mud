import { storeEventsAbi } from "@latticexyz/store";
import { createStorageAdapter } from "../../zustand/createStorageAdapter";
import { ZustandStore, createStore } from "../../zustand/createStore";
import { config } from "../../../test/deployMockGame";
import { fetchAndStoreLogs } from "../../fetchAndStoreLogs";
import { publicClient } from "../../../test/common";
import { storeTables, worldTables } from "../../common";
import { AllTables } from "../common";

export const tables = {
  ...config.tables,
  ...storeTables,
  ...worldTables,
} as unknown as AllTables<typeof config>;

export async function createHydratedStore(): Promise<ZustandStore<typeof tables>> {
  const useStore = createStore<typeof tables>({ tables });
  const storageAdapter = createStorageAdapter({ store: useStore });

  console.log("fetching blocks");
  for await (const block of fetchAndStoreLogs({
    storageAdapter,
    publicClient,
    events: storeEventsAbi,
    fromBlock: 0n,
    toBlock: await publicClient.getBlockNumber(),
  })) {
    // console.log("got block", block.blockNumber);
  }

  return useStore;
}
