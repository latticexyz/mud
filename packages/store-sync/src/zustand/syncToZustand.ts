import { SyncOptions, SyncResult, mudTables } from "../common";
import { createStoreSync } from "../createStoreSync";
import { ZustandStore } from "./createStore";
import { createStore } from "./createStore";
import { createStorageAdapter } from "./createStorageAdapter";
import { Address } from "viem";
import { SyncStep } from "../SyncStep";
import { Store as StoreConfig } from "@latticexyz/store";
import { Tables } from "@latticexyz/config";
import { merge } from "@ark/util";
import { configToTables } from "../configToTables";

export type SyncToZustandOptions<config extends StoreConfig, extraTables extends Tables> = Omit<
  SyncOptions,
  "address" | "config"
> & {
  // require address for now to keep the data model + retrieval simpler
  address: Address;
  config: config;
  tables?: extraTables;
  store?: ZustandStore<merge<merge<configToTables<config>, extraTables>, mudTables>>;
  startSync?: boolean;
};

export type SyncToZustandResult<config extends StoreConfig, extraTables extends Tables> = SyncResult & {
  tables: merge<merge<configToTables<config>, extraTables>, mudTables>;
  useStore: ZustandStore<merge<merge<configToTables<config>, extraTables>, mudTables>>;
  stopSync: () => void;
};

export async function syncToZustand<config extends StoreConfig, extraTables extends Tables = {}>({
  config,
  tables: extraTables = {} as extraTables,
  store,
  startSync = true,
  ...syncOptions
}: SyncToZustandOptions<config, extraTables>): Promise<SyncToZustandResult<config, extraTables>> {
  const tables = {
    ...configToTables(config),
    ...extraTables,
    ...mudTables,
  } as unknown as merge<merge<configToTables<config>, extraTables>, mudTables>;
  const useStore = store ?? createStore({ tables });
  const storageAdapter = createStorageAdapter({ store: useStore });

  const storeSync = await createStoreSync({
    storageAdapter,
    ...syncOptions,
    onProgress: (syncProgress) => {
      // already live, no need for more progress updates
      if (useStore.getState().syncProgress.step === SyncStep.LIVE) return;
      useStore.setState(() => ({ syncProgress }));
    },
  });

  const sub = startSync ? storeSync.storedBlockLogs$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  return {
    ...storeSync,
    tables,
    useStore,
    stopSync,
  };
}
