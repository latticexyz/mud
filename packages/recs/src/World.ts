import { hasComponent } from "./Component";
import { Component, EntityIndex, EntityID, World } from "./types";

/**
 * Create a new World.
 *
 * @remarks
 * A World is the central object of an ECS application, where all {@link defineComponent Components},
 * {@link registerEntity Entities} and {@link defineSystem Systems} are registerd.
 *
 * @returns A new World
 */
export function createWorld() {
  const entityToIndex = new Map<EntityID, EntityIndex>();
  const entities: EntityID[] = [];
  const components: Component[] = [];
  let disposers: [string, () => void][] = [];

  function getEntityIndexStrict(entity: EntityID): EntityIndex {
    const index = entityToIndex.get(entity);
    if (index == null) throw new Error("entity does not exist");
    return index;
  }

  function registerEntity({ id, idSuffix }: { id?: EntityID; idSuffix?: string } = {}) {
    const entity = (id || entities.length + (idSuffix ? "-" + idSuffix : "")) as EntityID;

    // Skip if entity already exists
    let index = entityToIndex.get(entity);
    if (index != null) return index;

    // Register entity
    index = (entities.push(entity) - 1) as EntityIndex;
    entityToIndex.set(entity, index);
    return index;
  }

  function registerComponent(component: Component) {
    components.push(component);
  }

  function dispose(namespace?: string) {
    for (const [, disposer] of disposers.filter((d) => !namespace || d[0] === namespace)) {
      disposer();
    }
    disposers = disposers.filter((d) => namespace && d[0] !== namespace);
  }

  function registerDisposer(disposer: () => void, namespace = "") {
    disposers.push([namespace, disposer]);
  }

  function hasEntity(entity: EntityID): boolean {
    return entityToIndex.get(entity) != null;
  }

  return {
    entities,
    entityToIndex,
    registerEntity,
    components,
    registerComponent,
    dispose,
    registerDisposer,
    getEntityIndexStrict,
    hasEntity,
  };
}

/**
 * Create a new namespace from an existing World.
 * The `dispose` method of a namespaced World only calls disposers registered on this namespace.
 *
 * @param world World to create a new namespace for.
 * @param namespace String descriptor of the new namespace.
 * @returns World with a new namespace.
 */
export function namespaceWorld(world: ReturnType<typeof createWorld>, namespace: string) {
  return {
    ...world,
    registerDisposer: (disposer: () => void) => world.registerDisposer(disposer, namespace),
    dispose: () => world.dispose(namespace),
  };
}

/**
 * Get all components that have a value for the given entity.
 *
 * @dev Design decision: don't store a list of components for each entity but compute it dynamically when needed
 * because there are less components than entities and maintaining a list of components per entity is a large overhead.
 *
 * @param world World object the given entity is registered on.
 * @param entity {@link EntityIndex} of the entity to get the list of components for.
 * @returns Array of components that have a value for the given entity.
 */
export function getEntityComponents(world: World, entity: EntityIndex): Component[] {
  return world.components.filter((component) => hasComponent(component, entity));
}
