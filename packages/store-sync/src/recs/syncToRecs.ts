import { StoreConfig, Table, ResolvedStoreConfig, resolveConfig } from "@latticexyz/store";
import { Component as RecsComponent, World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { RecsStorageAdapter, recsStorage } from "./recsStorage";
import { createStoreSync } from "../createStoreSync";
import { singletonEntity } from "./singletonEntity";
import { SyncStep } from "../SyncStep";

type SyncToRecsOptions<config extends StoreConfig, extraTables extends Record<string, Table>> = SyncOptions<config> & {
  world: RecsWorld;
  config: config;
  tables?: extraTables;
  startSync?: boolean;
};

type SyncToRecsResult<config extends StoreConfig, extraTables extends Record<string, Table>> = SyncResult & {
  components: RecsStorageAdapter<ResolvedStoreConfig<config>["tables"] & extraTables>["components"];
  stopSync: () => void;
};

export async function syncToRecs<config extends StoreConfig, extraTables extends Record<string, Table>>({
  world,
  config,
  tables: extraTables,
  startSync = true,
  ...syncOptions
}: SyncToRecsOptions<config, extraTables>): Promise<SyncToRecsResult<config, extraTables>> {
  const tables = {
    ...resolveConfig(config).tables,
    ...extraTables,
  } as ResolvedStoreConfig<config>["tables"] & extraTables;

  const { storageAdapter, components } = recsStorage({
    world,
    tables,
    shouldSkipUpdateStream: (): boolean =>
      getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE,
  });

  const storeSync = await createStoreSync({
    storageAdapter,
    config,
    ...syncOptions,
    onProgress: ({ step, percentage, latestBlockNumber, lastBlockNumberProcessed, message }) => {
      // already live, no need for more progress updates
      if (getComponentValue(components.SyncProgress, singletonEntity)?.step === SyncStep.LIVE) return;

      setComponent(components.SyncProgress, singletonEntity, {
        step,
        percentage,
        latestBlockNumber,
        lastBlockNumberProcessed,
        message,
      });

      // when we switch to live, trigger update for all entities in all components
      if (step === SyncStep.LIVE) {
        for (const _component of Object.values(components)) {
          // downcast component for easier calling of generic methods on all components
          const component = _component as RecsComponent;
          for (const entity of component.entities()) {
            const value = getComponentValue(component, entity);
            component.update$.next({ component, entity, value: [value, value] });
          }
        }
      }
    },
  });

  const sub = startSync ? storeSync.storedBlockLogs$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  world.registerDisposer(stopSync);

  return {
    ...storeSync,
    components,
    stopSync,
  };
}
