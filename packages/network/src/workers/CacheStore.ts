import { Components, ComponentValue, EntityID, SchemaOf } from "@latticexyz/recs";
import { packTuple, transformIterator, unpackTuple } from "@latticexyz/utils";
import { initCache } from "../initCache";
import { ECSStateReply } from "@latticexyz/services/protobuf/ts/ecs-snapshot/ecs-snapshot";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { formatEntityID } from "../utils";
import { debug as parentDebug } from "./debug";

const debug = parentDebug.extend("CacheStore");

export type State = Map<number, ComponentValue>;
export type CacheStore = ReturnType<typeof createCacheStore>;
export type ECSCache = Awaited<ReturnType<typeof getIndexDbECSCache>>;

export function getCacheId(namespace: string, chainId: number, worldAddress: string) {
  return `${namespace}-${chainId}-${worldAddress}`;
}

export function createCacheStore() {
  const components: string[] = [];
  const componentToIndex = new Map<string, number>();
  const entities: string[] = [];
  const entityToIndex = new Map<string, number>();
  const blockNumber = 0;
  const state: State = new Map<number, ComponentValue>();

  return { components, componentToIndex, entities, entityToIndex, blockNumber, state };
}

export function storeEvent<Cm extends Components>(
  cacheStore: CacheStore,
  { component, entity, value, partialValue, blockNumber }: Omit<NetworkComponentUpdate<Cm>, "lastEventInTx" | "txHash">
) {
  // Remove the 0 padding from all entityes
  const normalizedEntity = formatEntityID(entity);

  const { components, entities, componentToIndex, entityToIndex, state } = cacheStore;

  // Get component index
  let componentIndex = componentToIndex.get(component);
  if (componentIndex == null) {
    componentIndex = components.push(component) - 1;
    componentToIndex.set(component as string, componentIndex);
  }

  // Get entity index
  let entityIndex = entityToIndex.get(normalizedEntity);
  if (entityIndex == null) {
    entityIndex = entities.push(normalizedEntity) - 1;
    entityToIndex.set(normalizedEntity, entityIndex);
  }

  // Entity index gets the right 24 bits, component index the left 8 bits
  const key = packTuple([componentIndex, entityIndex]);

  // keep this logic aligned with applyNetworkUpdates
  if (partialValue !== undefined) {
    const currentValue = state.get(key);
    if (currentValue === undefined) {
      console.warn("Can't make partial update on unset component value.", {
        component,
        entity,
        entityIndex,
        partialValue,
      });
    } else {
      state.set(key, { ...currentValue, ...partialValue });
    }
  } else if (value === undefined) {
    console.log("deleting key", key);
    state.delete(key);
  } else {
    state.set(key, value);
  }

  // Set block number to one less than the last received event's block number
  // (Events are expected to be ordered, so once a new block number appears,
  // the previous block number is done processing)
  cacheStore.blockNumber = blockNumber - 1;
}

export function storeEvents<Cm extends Components>(
  cacheStore: CacheStore,
  events: Omit<NetworkComponentUpdate<Cm>, "lastEventInTx" | "txHash">[]
) {
  for (const event of events) {
    storeEvent(cacheStore, event);
  }
}

export function getCacheStoreEntries<Cm extends Components>({
  blockNumber,
  state,
  components,
  entities,
}: CacheStore): IterableIterator<NetworkComponentUpdate<Cm>> {
  return transformIterator(state.entries(), ([key, value]) => {
    const [componentIndex, entityIndex] = unpackTuple(key);
    const component = components[componentIndex];
    const entity = entities[entityIndex];

    if (component == null || entity == null) {
      throw new Error(`Unknown component / entity: ${component}, ${entity}`);
    }

    const ecsEvent: NetworkComponentUpdate<Cm> = {
      type: NetworkEvents.NetworkComponentUpdate,
      component,
      entity: entity as EntityID,
      value: value as ComponentValue<SchemaOf<Cm[keyof Cm]>>,
      lastEventInTx: false,
      txHash: "cache",
      blockNumber: blockNumber,
    };

    return ecsEvent;
  });
}

export function mergeCacheStores(stores: CacheStore[]): CacheStore {
  const result = createCacheStore();

  // Sort by block number (increasing)
  const sortedStores = [...stores].sort((a, b) => a.blockNumber - b.blockNumber);

  // Insert the cached events into the result store (from stores with low block number to high number)
  for (const store of sortedStores) {
    for (const updateEvent of getCacheStoreEntries(store)) {
      storeEvent(result, updateEvent);
    }
  }

  result.blockNumber = sortedStores[sortedStores.length - 1].blockNumber;

  return result;
}

export async function saveCacheStoreToIndexDb(cache: ECSCache, store: CacheStore) {
  debug("store cache with size", store.state.size, "at block", store.blockNumber);
  await cache.set("ComponentValues", "current", store.state);
  await cache.set("Mappings", "components", store.components);
  await cache.set("Mappings", "entities", store.entities);
  await cache.set("BlockNumber", "current", store.blockNumber);
}

export async function loadIndexDbCacheStore(cache: ECSCache): Promise<CacheStore> {
  const state = (await cache.get("ComponentValues", "current")) ?? new Map<number, ComponentValue>();
  const blockNumber = (await cache.get("BlockNumber", "current")) ?? 0;
  const components = (await cache.get("Mappings", "components")) ?? [];
  const entities = (await cache.get("Mappings", "entities")) ?? [];
  const componentToIndex = new Map<string, number>();
  const entityToIndex = new Map<string, number>();

  // Init componentToIndex map
  for (let i = 0; i < components.length; i++) {
    componentToIndex.set(components[i], i);
  }

  // Init entityToIndex map
  for (let i = 0; i < entities.length; i++) {
    entityToIndex.set(entities[i], i);
  }

  return { state, blockNumber, components, entities, componentToIndex, entityToIndex };
}

export async function getIndexDBCacheStoreBlockNumber(cache: ECSCache): Promise<number> {
  return (await cache.get("BlockNumber", "current")) ?? 0;
}

export function getIndexDbECSCache(chainId: number, worldAddress: string, version?: number, idb?: IDBFactory) {
  return initCache<{
    ComponentValues: State;
    BlockNumber: number;
    Mappings: string[];
    Snapshot: ECSStateReply;
  }>(
    getCacheId("ECSCache", chainId, worldAddress), // Store a separate cache for each World contract address
    ["ComponentValues", "BlockNumber", "Mappings", "Snapshot"],
    version,
    idb
  );
}
