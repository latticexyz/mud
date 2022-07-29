import { Components, ComponentValue, EntityID, SchemaOf } from "@latticexyz/recs";
import { packTuple, transformIterator, unpackTuple } from "@latticexyz/utils";
import { initCache } from "../../initCache";
import { ECSStateReply } from "../../snapshot";
import { NetworkComponentUpdate } from "../../types";
import { getCacheId } from "../utils";
import { State } from "./Cache.worker";

export type CacheStore = ReturnType<typeof createCacheStore>;

export function storeEvent<Cm extends Components>(
  { components, entities, componentToIndex, entityToIndex, state }: CacheStore,
  { component, entity, value }: Omit<NetworkComponentUpdate<Cm>, "lastEventInTx" | "txHash" | "blockNumber">
) {
  console.log("start store event", components);
  // Get component index
  let componentIndex = componentToIndex.get(component);
  if (componentIndex == null) {
    componentIndex = components.push(component) - 1;
    componentToIndex.set(component as string, componentIndex);
  }

  console.log("components after", components);

  // Get entity index
  let entityIndex = entityToIndex.get(entity);
  if (entityIndex == null) {
    entityIndex = entities.push(entity) - 1;
    entityToIndex.set(entity, entityIndex);
  }

  // Entity index gets the right 24 bits, component index the left 8 bits
  const key = packTuple([componentIndex, entityIndex]);
  console.log("store", key, componentIndex, entityIndex, component, entity, value);
  if (value == null) state.delete(key);
  else state.set(key, value);

  console.log("done storing event", components);
}

function getCacheStoreEntries<Cm extends Components>({
  blockNumber,
  state,
  components,
  entities,
}: CacheStore): IterableIterator<NetworkComponentUpdate<Cm>> {
  console.log("Loading from cache at block", blockNumber);
  console.log("State size", state.size);

  return transformIterator(state.entries(), ([key, value]) => {
    const [componentIndex, entityIndex] = unpackTuple(key);
    const component = components[componentIndex];
    const entity = entities[entityIndex];

    console.log("load", key, componentIndex, entityIndex, component, entity);

    if (component == null || entity == null) {
      throw new Error(`Unknown component / entity: ${component}, ${entity}`);
    }

    const ecsEvent: NetworkComponentUpdate<Cm> = {
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

export function createCacheStore() {
  const components: string[] = [];
  const componentToIndex = new Map<string, number>();
  const entities: string[] = [];
  const entityToIndex = new Map<string, number>();
  const blockNumber = 0;
  const state: State = new Map<number, ComponentValue>();

  return { components, componentToIndex, entities, entityToIndex, blockNumber, state };
}

export function mergeCacheStores(stores: CacheStore[]): CacheStore {
  console.log("Merging cache stores");
  const result = createCacheStore();

  // Sort by block number (increasing)
  const sortedStores = [...stores].sort((a, b) => a.blockNumber - b.blockNumber);

  // Insert the cached events into the result store (from stores with low block number to high number)
  for (const store of sortedStores) {
    for (const updateEvent of getCacheStoreEntries(store)) {
      storeEvent(result, updateEvent);
    }
  }

  console.log("Done mergint cache stores");
  return result;
}

export async function loadIndexDbCacheStore(chainId: number, worldAddress: string): Promise<CacheStore> {
  const cache = await getIndexDbCache(chainId, worldAddress);

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

  // Close db connection
  cache.db.close();

  return { state, blockNumber, components, entities, componentToIndex, entityToIndex };
}

export async function saveCacheStoreToIndexDb(store: CacheStore, chainId: number, worldAddress: string) {
  const cache = await getIndexDbCache(chainId, worldAddress);

  console.log("Store cache with size", store.state.size, "at block", store.blockNumber);
  await cache.set("ComponentValues", "current", store.state);
  await cache.set("Mappings", "components", store.components);
  await cache.set("Mappings", "entities", store.entities);
  await cache.set("BlockNumber", "current", store.blockNumber);

  // Close db connection
  cache.db.close();
  console.log("Done storing cache");
}

export function getIndexDbCache(chainId: number, worldAddress: string) {
  return initCache<{
    ComponentValues: State;
    BlockNumber: number;
    Mappings: string[];
    Checkpoint: ECSStateReply;
  }>(
    getCacheId(chainId, worldAddress), // Store a separate cache for each World contract address
    ["ComponentValues", "BlockNumber", "Mappings", "Checkpoint"]
  );
}
