import { getComponentEntities, getComponentValue } from "./Component";
import { Component, ComponentValue, EntityIndex, Indexer, Metadata, Schema } from "./types";

// Simple implementation of a "reverse mapping" indexer.
// Could be made more memory efficient by using a hash of the value as key.
export function createIndexer<S extends Schema, M extends Metadata>(component: Component<S, M>): Indexer<S, M> {
  const valueToEntities = new Map<string, Set<EntityIndex>>();

  function getEntitiesWithValue(value: ComponentValue<S>) {
    const entities = valueToEntities.get(getValueKey(value));
    return entities ? new Set([...entities]) : new Set<EntityIndex>();
  }

  function getValueKey(value: ComponentValue<S>): string {
    return Object.values(value).join("/");
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

  component.world.registerDisposer(() => subscription?.unsubscribe());

  return { ...component, getEntitiesWithValue };
}
