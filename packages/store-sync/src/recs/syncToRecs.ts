import { StoreConfig } from "@latticexyz/store";
import { World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { recsStorage } from "./recsStorage";
import { defineInternalComponents } from "./defineInternalComponents";
import { createStoreSync } from "../createStoreSync";
import { ConfigToRecsComponents } from "./common";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { singletonEntity } from "./singletonEntity";
import { SyncStep } from "../SyncStep";

type SyncToRecsOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  world: RecsWorld;
  config: TConfig;
  startSync?: boolean;
};

type SyncToRecsResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig> & {
  components: ConfigToRecsComponents<TConfig> &
    ConfigToRecsComponents<typeof storeConfig> &
    ConfigToRecsComponents<typeof worldConfig> &
    ReturnType<typeof defineInternalComponents>;
  stopSync: () => void;
};

export async function syncToRecs<TConfig extends StoreConfig = StoreConfig>({
  world,
  config,
  address,
  publicClient,
  startBlock,
  maxBlockRange,
  initialState,
  indexerUrl,
  startSync = true,
}: SyncToRecsOptions<TConfig>): Promise<SyncToRecsResult<TConfig>> {
  const { storageAdapter, components } = recsStorage({ world, config });

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
      if (getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE) {
        setComponent(components.SyncProgress, singletonEntity, {
          step,
          percentage,
          latestBlockNumber,
          lastBlockNumberProcessed,
          message,
        });
      }
    },
  });

  const sub = startSync ? storeSync.blockStorageOperations$.subscribe() : null;
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
