import { Component as RecsComponent, World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { createStorageAdapter } from "./createStorageAdapter";
import { SyncStep } from "../SyncStep";
import { SyncAdapter } from "../common";
import { createStoreSync } from "../createStoreSync";
import { singletonEntity } from "./singletonEntity";
import { Store as StoreConfig } from "@latticexyz/store";
import { registerComponents } from "./registerComponents";

export type CreateSyncAdapterOptions<config extends StoreConfig> = {
  world: RecsWorld;
  config: config;
};

export function createSyncAdapter<const config extends StoreConfig>({
  world,
  config,
}: CreateSyncAdapterOptions<config>): {
  syncAdapter: SyncAdapter;
  components: registerComponents<config>;
} {
  const components = registerComponents({ world, config });

  const syncAdapter: SyncAdapter = (opts) => {
    // TODO: clear component values?

    const { storageAdapter } = createStorageAdapter({
      world,
      tables: {},
      shouldSkipUpdateStream: (): boolean => {
        const value = getComponentValue(components.SyncProgress, singletonEntity);
        return value?.step !== SyncStep.LIVE;
      },
    });

    return createStoreSync({
      ...opts,
      storageAdapter,
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
  };

  return { syncAdapter, components };
}
