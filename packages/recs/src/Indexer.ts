import { getComponentEntities, getComponentValue } from "./Component";
import { Component, ComponentValue, EntityIndex, Indexer, Schema, World } from "./types";

// Simple implementation of a "reverse mapping" indexer.
// Could be made more memory efficient by using a hash of the value as key.
export function createIndexer<S extends Schema>(world: World, component: Component<S>): Indexer<S> {
  const valueToEntities = new Map<string, Set<EntityIndex>>();

  function getEntitiesWithValue(value: ComponentValue<S>) {
    return valueToEntities.get(getValueKey(value)) ?? new Set<EntityIndex>();
  }

  function getValueKey(value: ComponentValue<S>): string {
    return JSON.stringify(value);
  }

  function add(entity: EntityIndex, value: ComponentValue<S> | undefined) {
    if (!value) return;
    const valueKey = getValueKey(value);
    let entitiesWithValue = valueToEntities.get(valueKey);
    if (!entitiesWithValue) {
      entitiesWithValue = new Set<EntityIndex>();
      valueToEntities.set(valueKey, entitiesWithValue);
    }
    entitiesWithValue.add(entity);
  }

  function remove(entity: EntityIndex, value: ComponentValue<S> | undefined) {
    if (!value) return;
    const valueKey = getValueKey(value);
    const entitiesWithValue = valueToEntities.get(valueKey);
    if (!entitiesWithValue) return;
    entitiesWithValue.delete(entity);
  }

  // Initial indexing
  for (const entity of getComponentEntities(component)) {
    const value = getComponentValue(component, entity);
    add(entity, value);
  }

  // Keeping index up to date
  const subscription = component.update$.subscribe(({ entity, value }) => {
    // Remove from previous location
    remove(entity, value[1]);

    // Add to new location
    add(entity, value[0]);
  });

  world.registerDisposer(() => subscription?.unsubscribe());

  return { ...component, id: `index/${component.id}`, getEntitiesWithValue };
}
