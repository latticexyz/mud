import { SyncOptions, SyncResult, storeTables, worldTables } from "../common";
import { createStoreSync } from "../createStoreSync";
import { ZustandStore } from "./createStore";
import { createStore } from "./createStore";
import { createStorageAdapter } from "./createStorageAdapter";
import { Address } from "viem";
import { SyncStep } from "../SyncStep";
import { Store as StoreConfig } from "@latticexyz/store";
import { Tables } from "@latticexyz/config";

type AllTables<config extends StoreConfig, extraTables extends Tables = {}> = {
  readonly [key in
    | keyof config["tables"]
    | keyof extraTables
    | keyof storeTables
    | keyof worldTables]: key extends keyof worldTables
    ? worldTables[key]
    : key extends keyof storeTables
      ? storeTables[key]
      : key extends keyof extraTables
        ? extraTables[key]
        : key extends keyof config["tables"]
          ? config["tables"][key]
          : never;
};

type SyncToZustandOptions<config extends StoreConfig, extraTables extends Tables = {}> = Omit<
  SyncOptions,
  "address" | "config"
> & {
  // require address for now to keep the data model + retrieval simpler
  address: Address;
  config: config;
  tables?: extraTables;
  store?: ZustandStore<AllTables<config, extraTables>>;
  startSync?: boolean;
};

type SyncToZustandResult<config extends StoreConfig, extraTables extends Tables = {}> = SyncResult & {
  tables: AllTables<config, extraTables>;
  useStore: ZustandStore<AllTables<config, extraTables>>;
  stopSync: () => void;
};

export async function syncToZustand<config extends StoreConfig, extraTables extends Tables = {}>({
  config,
  tables: extraTables,
  store,
  startSync = true,
  ...syncOptions
}: SyncToZustandOptions<config, extraTables>): Promise<SyncToZustandResult<config, extraTables>> {
  const tables = {
    ...config.tables,
    ...extraTables,
    ...storeTables,
    ...worldTables,
  } as const;

  const useStore = store ?? createStore({ tables });
  const storageAdapter = createStorageAdapter({ store: useStore as never });

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
  } as never;
}
