import { hasComponent } from "./Component";
import { Component, EntityIndex, EntityID, World } from "./types";

export function createWorld() {
  const entityToIndex = new Map<EntityID, EntityIndex>();
  const entities: EntityID[] = [];
  const components: Component[] = [];
  let disposers: (() => void)[] = [];

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

  function dispose() {
    for (let i = 0; i < disposers.length; i++) {
      disposers[i]();
    }
    disposers = [];
  }

  function registerDisposer(disposer: () => void) {
    disposers.push(disposer);
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

// Design decision: don't store a list of components for each entity but compute it dynamically when needed
// because there are less components than entities and maintaining a list of components per entity is a large overhead
export function getEntityComponents(world: World, entity: EntityIndex): Component[] {
  return world.components.filter((component) => hasComponent(component, entity));
}
