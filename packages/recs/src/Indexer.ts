import { getComponentEntities, getComponentValue } from "./Component";
import { getEntityString, getEntitySymbol } from "./Entity";
import { Component, ComponentValue, Entity, EntitySymbol, Indexer, Metadata, Schema } from "./types";

/**
 * Create an indexed component from a given component.
 *
 * @remarks
 * An indexed component keeps a "reverse mapping" from {@link ComponentValue} to the Set of {@link createEntity Entities} with this value.
 * This adds a performance overhead to modifying component values and a memory overhead since in the worst case there is one Set per entity (if every entity has a different component value).
 * In return the performance for querying for entities with a given component value is close to O(1) (instead of O(#entities) in a regular non-indexed component).
 * As a rule of thumb only components that are added to many entities and are queried with {@link HasValue} a lot should be indexed (eg. the Position component).
 *
 * @dev This could be made more (memory) efficient by using a hash of the component value as key, but would require handling hash collisions.
 *
 * @param component {@link defineComponent Component} to index.
 * @returns Indexed version of the component.
 */
export function createIndexer<S extends Schema, M extends Metadata, T = undefined>(
  component: Component<S, M, T>
): Indexer<S, M, T> {
  const valueToEntities = new Map<string, Set<EntitySymbol>>();

  function getEntitiesWithValue(value: ComponentValue<S, T>) {
    const entities = valueToEntities.get(getValueKey(value));
    return entities ? new Set([...entities].map(getEntityString)) : new Set<Entity>();
  }

  function getValueKey(value: ComponentValue<S, T>): string {
    return Object.values(value).join("/");
  }

  function add(entity: EntitySymbol, value: ComponentValue<S, T> | undefined) {
    if (!value) return;
    const valueKey = getValueKey(value);
    let entitiesWithValue = valueToEntities.get(valueKey);
    if (!entitiesWithValue) {
      entitiesWithValue = new Set<EntitySymbol>();
      valueToEntities.set(valueKey, entitiesWithValue);
    }
    entitiesWithValue.add(entity);
  }

  function remove(entity: EntitySymbol, value: ComponentValue<S, T> | undefined) {
    if (!value) return;
    const valueKey = getValueKey(value);
    const entitiesWithValue = valueToEntities.get(valueKey);
    if (!entitiesWithValue) return;
    entitiesWithValue.delete(entity);
  }

  // Initial indexing
  for (const entity of getComponentEntities(component)) {
    const value = getComponentValue(component, entity);
    add(getEntitySymbol(entity), value);
  }

  // Keeping index up to date
  const subscription = component.update$.subscribe(({ entity, value }) => {
    // Remove from previous location
    remove(getEntitySymbol(entity), value[1]);

    // Add to new location
    add(getEntitySymbol(entity), value[0]);
  });

  component.world.registerDisposer(() => subscription?.unsubscribe());

  return { ...component, getEntitiesWithValue };
}
