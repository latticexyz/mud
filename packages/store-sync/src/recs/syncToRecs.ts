import { Tables } from "@latticexyz/config";
import { Store as StoreConfig } from "@latticexyz/store";
import { Component as RecsComponent, World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { createStorageAdapter } from "./createStorageAdapter";
import { createStoreSync } from "../createStoreSync";
import { singletonEntity } from "./singletonEntity";
import { SyncStep } from "../SyncStep";
import { registerComponents } from "./registerComponents";

export type SyncToRecsOptions<
  config extends StoreConfig = StoreConfig,
  extraTables extends Tables = Tables,
> = SyncOptions & {
  world: RecsWorld;
  config: config;
  tables?: extraTables;
  startSync?: boolean;
};

export type SyncToRecsResult<config extends StoreConfig, extraTables extends Tables> = SyncResult & {
  components: registerComponents<config, extraTables>;
  stopSync: () => void;
};

export async function syncToRecs<const config extends StoreConfig, const extraTables extends Tables = {}>({
  world,
  config,
  tables: extraTables = {} as extraTables,
  startSync = true,
  ...syncOptions
}: SyncToRecsOptions<config, extraTables>): Promise<SyncToRecsResult<config, extraTables>> {
  const components = registerComponents({ world, config, extraTables });

  const { storageAdapter } = createStorageAdapter({
    world,
    tables: {},
    shouldSkipUpdateStream: (): boolean =>
      getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE,
  });

  const storeSync = await createStoreSync({
    storageAdapter,
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
  } as never;
}
