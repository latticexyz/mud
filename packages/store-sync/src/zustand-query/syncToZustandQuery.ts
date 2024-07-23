import { Store as StoreConfig } from "@latticexyz/store";
import { SyncOptions, SyncResult } from "../common";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStoreSync } from "../createStoreSync";
import { SyncStep } from "../SyncStep";
import { BoundTable, Store } from "@latticexyz/zustand-query/internal";

type SyncToZustandQueryOptions = SyncOptions & {
  store: Store;
  config: StoreConfig;
  startSync?: boolean;
};

type SyncToZustandQueryResult = SyncResult & {
  stopSync: () => void;
  SyncProgress: BoundTable;
};

export async function syncToZustandQuery({
  store,
  config,
  startSync = true,
  ...syncOptions
}: SyncToZustandQueryOptions): Promise<SyncToZustandQueryResult> {
  const { storageAdapter } = createStorageAdapter({
    store,
  });

  // Create SyncProgress table
  const SyncProgress = store.getState().actions.registerTable({
    namespace: "store_sync_internal",
    label: "SyncProgress",
    schema: {
      step: "uint8",
      percentage: "uint32",
      latestBlockNumber: "uint256",
      lastBlockNumberProcessed: "uint256",
      message: "string",
    },
    key: [],
  });

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
