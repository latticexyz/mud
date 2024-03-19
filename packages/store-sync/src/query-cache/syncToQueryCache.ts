import { SyncOptions, SyncResult } from "../common";
import { createStoreSync } from "../createStoreSync";
import { Address } from "viem";
import { Store as StoreConfig } from "@latticexyz/store/config/v2";
import { createStore } from "./createStore";
import { createStorageAdapter } from "./createStorageAdapter";

type SyncToQueryCacheOptions<config extends StoreConfig> = Omit<SyncOptions<config>, "config"> & {
  config: config;
  // require address for now to keep the data model + retrieval simpler
  address: Address;
  startSync?: boolean;
};

type SyncToQueryCacheResult = SyncResult & {
  stopSync: () => void;
};

export async function syncToQueryCache<config extends StoreConfig>({
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
