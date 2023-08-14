import { StoreConfig } from "@latticexyz/store";
import { World as RecsWorld } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { recsStorage } from "./recsStorage";
import { defineInternalComponents } from "./defineInternalComponents";
import { createStoreSync } from "../createStoreSync";
import { ConfigToRecsComponents } from "./common";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { configToRecsComponents } from "./configToRecsComponents";
import { singletonEntity } from "./singletonEntity";

type SyncToRecsOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  world: RecsWorld;
  config: TConfig;
};

type SyncToRecsResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig> & {
  // TODO: return publicClient?
  components: ConfigToRecsComponents<TConfig> &
    ConfigToRecsComponents<typeof storeConfig> &
    ConfigToRecsComponents<typeof worldConfig> &
    ReturnType<typeof defineInternalComponents>;
};

export async function syncToRecs<TConfig extends StoreConfig = StoreConfig>({
  world,
  config,
  address,
  publicClient,
  startBlock = 0n,
  maxBlockRange,
  initialState,
  indexerUrl,
}: SyncToRecsOptions<TConfig>): Promise<SyncToRecsResult<TConfig>> {
  const components = {
    ...configToRecsComponents(world, config),
    ...configToRecsComponents(world, storeConfig),
    ...configToRecsComponents(world, worldConfig),
    ...defineInternalComponents(world),
  };

  world.registerEntity({ id: singletonEntity });

  const storeSync = await createStoreSync({
    storageAdapter: recsStorage({ components, config }),
    config,
    address,
    publicClient,
    startBlock,
    maxBlockRange,
    indexerUrl,
    initialState,
  });

  const sub = storeSync.latestBlockNumber$.subscribe();
  world.registerDisposer(() => sub.unsubscribe());

  return {
    ...storeSync,
    components,
  };
}
