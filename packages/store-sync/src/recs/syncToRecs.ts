import { StoreConfig } from "@latticexyz/store";
import { Component as RecsComponent, Schema as RecsSchema, World as RecsWorld } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { recsStorage } from "./recsStorage";
import { defineInternalComponents } from "./defineInternalComponents";
import { StoreComponentMetadata } from "./common";
import { createStoreSync } from "../createStoreSync";
import { singletonEntity } from "./singletonEntity";

type SyncToRecsOptions<
  TConfig extends StoreConfig = StoreConfig,
  TComponents extends Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>> = Record<
    string,
    RecsComponent<RecsSchema, StoreComponentMetadata>
  >
> = SyncOptions<TConfig> & {
  world: RecsWorld;
  // TODO: generate these from config and return instead?
  components: TComponents;
};

type SyncToRecsResult<
  TConfig extends StoreConfig = StoreConfig,
  TComponents extends Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>> = Record<
    string,
    RecsComponent<RecsSchema, StoreComponentMetadata>
  >
> = SyncResult<TConfig> & {
  // TODO: return publicClient?
  components: TComponents & ReturnType<typeof defineInternalComponents>;
};

export async function syncToRecs<
  TConfig extends StoreConfig = StoreConfig,
  TComponents extends Record<string, RecsComponent<RecsSchema, StoreComponentMetadata>> = Record<
    string,
    RecsComponent<RecsSchema, StoreComponentMetadata>
  >
>({
  world,
  config,
  address,
  publicClient,
  components: initialComponents,
  startBlock = 0n,
  maxBlockRange,
  initialState,
  indexerUrl,
}: SyncToRecsOptions<TConfig, TComponents>): Promise<SyncToRecsResult<TConfig, TComponents>> {
  const components = {
    ...initialComponents,
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
  world.registerDisposer(sub.unsubscribe);

  return {
    ...storeSync,
    components,
  };
}
