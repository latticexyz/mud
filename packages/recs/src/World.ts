import { transformIterator } from "@latticexyz/utils";
import { hasComponent, removeComponent } from "./Component";
import { getEntityString, getEntitySymbol } from "./Entity";
import { Component, Entity, EntitySymbol, World } from "./types";

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
  const entitySymbols = new Set<EntitySymbol>();
  const components: Component[] = [];
  let disposers: [string, () => void][] = [];

  function registerEntity({ id, idSuffix }: { id?: string; idSuffix?: string } = {}) {
    const entity = (id || entitySymbols.size + (idSuffix ? "-" + idSuffix : "")) as Entity;
    const entitySymbol = getEntitySymbol(entity);

    // Register entity
    entitySymbols.add(entitySymbol);

    return entity;
  }

  function getEntities() {
    return transformIterator(entitySymbols.values(), getEntityString);
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

  function hasEntity(entity: Entity): boolean {
    const entitySymbol = getEntitySymbol(entity);
    return entitySymbols.has(entitySymbol);
  }

  function deleteEntity(entity: Entity) {
    for (const component of components) {
      if (hasComponent(component, entity)) removeComponent(component, entity);
    }
    entitySymbols.delete(getEntitySymbol(entity));
  }

  return {
    registerEntity,
    components,
    registerComponent,
    dispose,
    registerDisposer,
    hasEntity,
    getEntities,
    entitySymbols,
    deleteEntity,
  } satisfies World;
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
 * @param entity {@link Entity} to get the list of components for.
 * @returns Array of components that have a value for the given entity.
 */
export function getEntityComponents(world: World, entity: Entity): Component[] {
  return world.components.filter((component) => hasComponent(component, entity));
}
