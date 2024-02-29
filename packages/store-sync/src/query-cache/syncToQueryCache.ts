import { StoreConfig, Tables, resolveConfig } from "@latticexyz/store";
import { SyncOptions, SyncResult, storeTables, worldTables } from "../common";
import { createStoreSync } from "../createStoreSync";
import { createStore } from "../zustand/createStore";
import { createStorageAdapter } from "../zustand/createStorageAdapter";
import { Address } from "viem";
import { SyncStep } from "../SyncStep";
import { AllTables } from "./common";

type SyncToZustandOptions<config extends StoreConfig, extraTables extends Tables | undefined> = SyncOptions & {
  // require address for now to keep the data model + retrieval simpler
  address: Address;
  config: config;
  tables?: extraTables;
  startSync?: boolean;
};

type SyncToZustandResult<config extends StoreConfig, extraTables extends Tables | undefined> = SyncResult & {
  tables: AllTables<config, extraTables>;
  stopSync: () => void;
};

export async function syncToZustand<config extends StoreConfig, extraTables extends Tables | undefined>({
  config,
  tables: extraTables,
  startSync = true,
  ...syncOptions
}: SyncToZustandOptions<config, extraTables>): Promise<SyncToZustandResult<config, extraTables>> {
  // TODO: migrate this once we redo config to return fully resolved tables (https://github.com/latticexyz/mud/issues/1668)
  // TODO: move store/world tables into `resolveConfig`
  const resolvedConfig = resolveConfig(config);
  const tables = {
    ...resolvedConfig.tables,
    ...extraTables,
    ...storeTables,
    ...worldTables,
  } as unknown as AllTables<config, extraTables>;

  const useStore = createStore({ tables });
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
    stopSync,
  };
}
