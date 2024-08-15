import { Store as StoreConfig } from "@latticexyz/store";
import { SyncOptions, SyncResult } from "../common";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStoreSync } from "../createStoreSync";
import { SyncStep } from "../SyncStep";
import { BoundTable, Store, registerTable } from "@latticexyz/stash/internal";
import { defineTable } from "@latticexyz/store/config/v2";

type SyncToStashOptions = SyncOptions & {
  stash: Store;
  config: StoreConfig;
  startSync?: boolean;
};

const syncProgressConfig = defineTable({
  namespace: "store_sync",
  label: "SyncProgress",
  schema: {
    step: "string",
    percentage: "uint32",
    latestBlockNumber: "uint256",
    lastBlockNumberProcessed: "uint256",
    message: "string",
  },
  key: [],
});

type SyncToStashResult = SyncResult & {
  stopSync: () => void;
  SyncProgress: BoundTable<typeof syncProgressConfig>;
};

export async function syncToStash({
  stash,
  config,
  startSync = true,
  ...syncOptions
}: SyncToStashOptions): Promise<SyncToStashResult> {
  const { storageAdapter } = createStorageAdapter({
    stash,
  });

  // Create SyncProgress table
  const SyncProgress = registerTable({
    stash,
    table: syncProgressConfig,
  });

  /**
   * Two potential approaches:
   *
   * - Fetch initial state from dozer SQL
   * - Encode to logs
   * - Fetch logs from min to max from RPC and append them at the end
   * - Pass everything as `initialRecords` to `createStoreSync`
   *
   * OR
   *
   * - Fetch initial state from dozer SQL, keep in temporary decoded structure
   * - Fetch logs from min to max from RPC, decode and apply to temporary structure
   * - Write everything in one go to the stash
   * - Skip fetching from indexer, continue syncing from RPC
   *
   * In both approaches we need the local tables to not send updates until the sync is done,
   * then send an update with the entire stash.
   *
   * The first approach seems like a lot of processing overhead (encoding records) but would be
   * compatible with all state libs. The second approach would be specific to ZustandQuery.
   *
   * Let's do first approach for now.
   */

  const storeSync = await createStoreSync({
    storageAdapter,
    config,
    ...syncOptions,
    onProgress: ({ step, percentage, latestBlockNumber, lastBlockNumberProcessed, message }) => {
      // already live, no need for more progress updates
      if (SyncProgress.getRecord({ key: {} }).step === SyncStep.LIVE) return;

      SyncProgress.setRecord({
        key: {},
        record: { step, percentage, latestBlockNumber, lastBlockNumberProcessed, message },
      });
    },
  });

  const sub = startSync ? storeSync.storedBlockLogs$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  return {
    ...storeSync,
    stopSync,
    SyncProgress,
  };
}
