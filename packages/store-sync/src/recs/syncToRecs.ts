import { StoreConfig } from "@latticexyz/store";
import { Component as RecsComponent, World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { RecsStorageAdapter, recsStorage } from "./recsStorage";
import { createStoreSync } from "../createStoreSync";
import { singletonEntity } from "./singletonEntity";
import { SyncStep } from "../SyncStep";
import { ConfigToTables, TablesInput } from "./common";
import { configToTables } from "./configToTables";

type SyncToRecsOptions<config extends StoreConfig, tables extends TablesInput | undefined> = SyncOptions<config> & {
  world: RecsWorld;
  config: config;
  tables?: tables;
  startSync?: boolean;
};

type SyncToRecsResult<config extends StoreConfig, extraTables extends TablesInput | undefined> = SyncResult & {
  components: RecsStorageAdapter<
    (ConfigToTables<config> extends TablesInput ? ConfigToTables<config> : Record<string, any>) &
      (extraTables extends TablesInput ? extraTables : Record<string, any>)
  >["components"];
  stopSync: () => void;
};

export async function syncToRecs<config extends StoreConfig, tables extends TablesInput>({
  world,
  config,
  tables: extraTables,
  address,
  publicClient,
  startBlock,
  maxBlockRange,
  initialState,
  indexerUrl,
  startSync = true,
}: SyncToRecsOptions<config, tables>): Promise<SyncToRecsResult<config, tables>> {
  const tables = {
    ...configToTables(config),
    ...extraTables,
  } as tables extends TablesInput ? ConfigToTables<config> & tables : ConfigToTables<config>;

  const { storageAdapter, components } = recsStorage({
    world,
    tables,
    shouldSkipUpdateStream: (): boolean =>
      getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE,
  });

  const storeSync = await createStoreSync({
    storageAdapter,
    config,
    address,
    publicClient,
    startBlock,
    maxBlockRange,
    indexerUrl,
    initialState,
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
