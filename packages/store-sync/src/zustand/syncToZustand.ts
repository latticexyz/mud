import { Tables } from "@latticexyz/store";
import { SyncOptions, SyncResult } from "../common";
import { createStoreSync } from "../createStoreSync";
import { ZustandStore } from "./createStore";
import { createStore } from "./createStore";
import { createStorageAdapter } from "./createStorageAdapter";

type SyncToZustandOptions<tables extends Tables> = SyncOptions & {
  tables: tables;
  store?: ZustandStore<tables>;
  startSync?: boolean;
};

type SyncToZustandResult<tables extends Tables> = SyncResult & {
  useStore: ZustandStore<tables>;
  stopSync: () => void;
};

export async function syncToZustand<tables extends Tables>({
  tables,
  store,
  startSync = true,
  ...syncOptions
}: SyncToZustandOptions<tables>): Promise<SyncToZustandResult<tables>> {
  const useStore = store ?? createStore({ tables });
  const storageAdapter = createStorageAdapter({ store: useStore });

  const storeSync = await createStoreSync({
    storageAdapter,
    ...syncOptions,
  });

  const sub = startSync ? storeSync.storedBlockLogs$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  return {
    ...storeSync,
    useStore,
    stopSync,
  };
}
