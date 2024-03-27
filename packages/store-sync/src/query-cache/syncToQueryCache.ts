import { SyncOptions, SyncResult } from "../common";
import { createStoreSync } from "../createStoreSync";
import { Address } from "viem";
import { Store } from "@latticexyz/store";
import { createStore } from "./createStore";
import { createStorageAdapter } from "./createStorageAdapter";

type SyncToQueryCacheOptions<config extends Store> = Omit<SyncOptions, "config"> & {
  // require address for now to keep the data model + retrieval simpler
  address: Address;
  config: config;
  startSync?: boolean;
};

type SyncToQueryCacheResult = SyncResult & {
  stopSync: () => void;
};

export async function syncToQueryCache<config extends Store>({
  config,
  startSync = true,
  ...syncOptions
}: SyncToQueryCacheOptions<config>): Promise<SyncToQueryCacheResult> {
  const useStore = createStore({ tables: config.tables });
  const storageAdapter = createStorageAdapter({ store: useStore });

  const storeSync = await createStoreSync({
    storageAdapter,
    ...syncOptions,
    // TODO: sync progress
  });

  const sub = startSync ? storeSync.storedBlockLogs$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  return {
    ...storeSync,
    stopSync,
  };
}
