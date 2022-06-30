import { hasComponent } from "./Component";
import { Component, EntityIndex, EntityID, World } from "./types";

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
    const index = (entities.push(entity) - 1) as EntityIndex;
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

export function namespaceWorld(world: ReturnType<typeof createWorld>, namespace: string) {
  return {
    ...world,
    registerDisposer: (disposer: () => void) => world.registerDisposer(disposer, namespace),
    dispose: () => world.dispose(namespace),
  };
}

// Design decision: don't store a list of components for each entity but compute it dynamically when needed
// because there are less components than entities and maintaining a list of components per entity is a large overhead
export function getEntityComponents(world: World, entity: EntityIndex): Component[] {
  return world.components.filter((component) => hasComponent(component, entity));
}
