import { StoreConfig } from "@latticexyz/store";
import {
  ComponentValue,
  Entity,
  Component as RecsComponent,
  Schema as RecsSchema,
  World as RecsWorld,
  getComponentValue,
  setComponent,
} from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { recsStorage } from "./recsStorage";
import { hexKeyTupleToEntity } from "./hexKeyTupleToEntity";
import { debug } from "./debug";
import { defineInternalComponents } from "./defineInternalComponents";
import { getTableKey } from "./getTableKey";
import { StoreComponentMetadata } from "./common";
import { SyncStep } from "../SyncStep";
import { encodeEntity } from "./encodeEntity";
import { createIndexerClient } from "../trpc-indexer";
import { createStoreSync } from "../createStoreSync";

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
  singletonEntity: Entity;
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

  const singletonEntity = world.registerEntity({ id: hexKeyTupleToEntity([]) });

  if (indexerUrl != null && initialState == null) {
    const indexer = createIndexerClient({ url: indexerUrl });
    try {
      initialState = await indexer.findAll.query({
        chainId: publicClient.chain.id,
        address,
      });
    } catch (error) {
      debug("couldn't get initial state from indexer", error);
    }
  }

  if (initialState != null && initialState.blockNumber != null) {
    debug("hydrating from initial state to block", initialState.blockNumber);
    startBlock = initialState.blockNumber + 1n;

    setComponent(components.SyncProgress, singletonEntity, {
      step: SyncStep.SNAPSHOT,
      message: `Hydrating from snapshot to block ${initialState.blockNumber}`,
      percentage: 0,
    });

    const componentList = Object.values(components);

    const numRecords = initialState.tables.reduce((sum, table) => sum + table.records.length, 0);
    const recordsPerSyncProgressUpdate = Math.floor(numRecords / 100);
    let recordsProcessed = 0;

    for (const table of initialState.tables) {
      setComponent(components.TableMetadata, getTableKey(table) as Entity, { table });
      const component = componentList.find((component) => component.id === table.tableId);
      if (component == null) {
        debug(`no component found for table ${table.namespace}:${table.name}, skipping initial state`);
        continue;
      }
      for (const record of table.records) {
        const entity = encodeEntity(table.keySchema, record.key);
        setComponent(component, entity, record.value as ComponentValue);

        recordsProcessed++;
        if (recordsProcessed % recordsPerSyncProgressUpdate === 0) {
          setComponent(components.SyncProgress, singletonEntity, {
            step: SyncStep.SNAPSHOT,
            message: `Hydrating from snapshot to block ${initialState.blockNumber}`,
            percentage: (recordsProcessed / numRecords) * 100,
          });
        }
      }
      debug(`hydrated ${table.records.length} records for table ${table.namespace}:${table.name}`);
    }

    setComponent(components.SyncProgress, singletonEntity, {
      step: SyncStep.SNAPSHOT,
      message: `Hydrating from snapshot to block ${initialState.blockNumber}`,
      percentage: (recordsProcessed / numRecords) * 100,
    });
  }

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

  let latestBlockNumber: bigint | null = null;
  {
    const sub = storeSync.latestBlockNumber$.subscribe((blockNumber) => {
      latestBlockNumber = blockNumber;
    });
    world.registerDisposer(sub.unsubscribe);
  }

  // Start the sync
  let lastBlockNumberProcessed: bigint | null = null;
  const sub = storeSync.blockStorageOperations$.subscribe(({ blockNumber, operations }) => {
    debug("stored", operations.length, "operations for block", blockNumber);
    lastBlockNumberProcessed = blockNumber;

    if (
      latestBlockNumber != null &&
      getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE
    ) {
      if (blockNumber < latestBlockNumber) {
        setComponent(components.SyncProgress, singletonEntity, {
          step: SyncStep.RPC,
          message: `Hydrating from RPC to block ${latestBlockNumber}`,
          percentage: (Number(blockNumber) / Number(latestBlockNumber)) * 100,
        });
      } else {
        setComponent(components.SyncProgress, singletonEntity, {
          step: SyncStep.LIVE,
          message: `All caught up!`,
          percentage: 100,
        });
      }
    }
  });

  world.registerDisposer(sub.unsubscribe);

  return {
    ...storeSync,
    components,
    singletonEntity,
  };
}
