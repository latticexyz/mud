import { Components, ComponentValue, Entity, SchemaOf } from "@latticexyz/recs";
import { packTuple, transformIterator, unpackTuple } from "@latticexyz/utils";
import { initCache } from "../initCache";
import { ECSStateReply } from "@latticexyz/services/ecs-snapshot";
import { NetworkComponentUpdate, NetworkEvents } from "../types";
import { normalizeEntityID } from "../utils";
import { debug as parentDebug } from "./debug";
import { Subject } from "rxjs";

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
  const componentUpdate$ = new Subject<{ component: string; entity: Entity; blockNumber: number }>();
  const keys: Record<number, Record<string | number, unknown>> = {}; // Mapping from entity index to key tuple
  const tables: Record<number, { namespace: string; table: string }> = {}; // Mapping from component index to namespace/table

  return { components, componentToIndex, entities, entityToIndex, blockNumber, state, componentUpdate$, keys, tables };
}

export function storeEvent<Cm extends Components>(
  cacheStore: CacheStore,
  {
    component,
    entity,
    value,
    partialValue,
    initialValue,
    blockNumber,
    key,
    namespace,
    table,
  }: Omit<NetworkComponentUpdate<Cm>, "lastEventInTx" | "txHash">
) {
  const entityId = normalizeEntityID(entity);

  const { components, entities, componentToIndex, entityToIndex, state, keys, tables } = cacheStore;

  // Get component index
  let componentIndex = componentToIndex.get(component);
  if (componentIndex == null) {
    componentIndex = components.push(component) - 1;
    componentToIndex.set(component as string, componentIndex);
  }

  // Get entity index
  let entityIndex = entityToIndex.get(entityId);
  if (entityIndex == null) {
    entityIndex = entities.push(entityId) - 1;
    entityToIndex.set(entityId, entityIndex);
  }

  // Store the key
  if (key) {
    keys[entityIndex] = key;
  }

  // Store the namespace/table
  if (namespace != null && table != null) {
    tables[componentIndex] = { namespace, table };
  }

  // Entity index gets the right 24 bits, component index the left 8 bits
  const cacheKey = packTuple([componentIndex, entityIndex]);

  // keep this logic aligned with applyNetworkUpdates
  if (partialValue !== undefined) {
    const currentValue = state.get(cacheKey);
    state.set(cacheKey, { ...initialValue, ...currentValue, ...partialValue });
  } else if (value === undefined) {
    console.log("deleting key", cacheKey);
    state.delete(cacheKey);
  } else {
    state.set(cacheKey, value);
  }

  // Set block number to one less than the last received event's block number
  // (Events are expected to be ordered, so once a new block number appears,
  // the previous block number is done processing)
  cacheStore.blockNumber = blockNumber - 1;

  cacheStore.componentUpdate$.next({ component, entity, blockNumber });
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
  keys,
  tables,
}: CacheStore): IterableIterator<NetworkComponentUpdate<Cm>> {
  return transformIterator(state.entries(), ([cacheKey, value]) => {
    const [componentIndex, entityIndex] = unpackTuple(cacheKey);
    const component = components[componentIndex];
    const entity = entities[entityIndex];
    const key = keys[entityIndex];
    const { namespace, table } = tables[componentIndex];

    if (component == null || entity == null) {
      throw new Error(`Unknown component / entity: ${component}, ${entity}`);
    }

    const ecsEvent: NetworkComponentUpdate<Cm> = {
      type: NetworkEvents.NetworkComponentUpdate,
      component,
      entity: entity as Entity,
      value: value as ComponentValue<SchemaOf<Cm[keyof Cm]>>,
      namespace,
      table,
      key,
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
  await cache.set("Keys", "current", store.keys);
  await cache.set("Tables", "current", store.tables);
}

export async function loadIndexDbCacheStore(cache: ECSCache): Promise<CacheStore> {
  const state = (await cache.get("ComponentValues", "current")) ?? new Map<number, ComponentValue>();
  const blockNumber = (await cache.get("BlockNumber", "current")) ?? 0;
  const components = (await cache.get("Mappings", "components")) ?? [];
  const entities = (await cache.get("Mappings", "entities")) ?? [];
  const keys = (await cache.get("Keys", "current")) ?? {};
  const tables = (await cache.get("Tables", "current")) ?? {};
  const componentToIndex = new Map<string, number>();
  const entityToIndex = new Map<string, number>();
  const componentUpdate$ = new Subject<{ component: string; entity: Entity; blockNumber: number }>();

  // Init componentToIndex map
  for (let i = 0; i < components.length; i++) {
    componentToIndex.set(components[i], i);
  }

  // Init entityToIndex map
  for (let i = 0; i < entities.length; i++) {
    entityToIndex.set(entities[i], i);
  }

  return { state, blockNumber, components, entities, componentToIndex, entityToIndex, componentUpdate$, keys, tables };
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
    Keys: Record<number, Record<string | number, unknown>>;
    Tables: Record<number, { namespace: string; table: string }>;
  }>(
    getCacheId("ECSCache", chainId, worldAddress), // Store a separate cache for each World contract address
    ["ComponentValues", "BlockNumber", "Mappings", "Snapshot", "Keys", "Tables"],
    version,
    idb
  );
}
