import { SyncOptions, SyncResult } from "../common";
import { createStoreSync } from "../createStoreSync";
import { ZustandStore } from "./createStore";
import { createStore } from "./createStore";
import { createStorageAdapter } from "./createStorageAdapter";
import { Address } from "viem";
import { SyncStep } from "../SyncStep";
import { Store as StoreConfig } from "@latticexyz/store";
import { Tables } from "@latticexyz/config";
import { getAllTables } from "../getAllTables";
import { merge } from "@arktype/util";
import { configToTables } from "../configToTables";

type SyncToZustandOptions<config extends StoreConfig, extraTables extends Tables = {}> = Omit<
  SyncOptions,
  "address" | "config"
> & {
  // require address for now to keep the data model + retrieval simpler
  address: Address;
  config: config;
  tables?: extraTables;
  store?: ZustandStore<getAllTables<merge<configToTables<config>, extraTables>>>;
  startSync?: boolean;
};

type SyncToZustandResult<config extends StoreConfig, extraTables extends Tables = {}> = SyncResult & {
  tables: getAllTables<merge<configToTables<config>, extraTables>>;
  useStore: ZustandStore<getAllTables<merge<configToTables<config>, extraTables>>>;
  stopSync: () => void;
};

export async function syncToZustand<config extends StoreConfig, extraTables extends Tables = {}>({
  config,
  tables: extraTables = {} as extraTables,
  store,
  startSync = true,
  ...syncOptions
}: SyncToZustandOptions<config, extraTables>): Promise<SyncToZustandResult<config, extraTables>> {
  const tables: getAllTables<merge<configToTables<config>, extraTables>> = getAllTables({
    ...configToTables(config),
    ...extraTables,
  });
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
