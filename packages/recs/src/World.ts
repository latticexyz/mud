import { hasComponent } from "./Component";
import { Component, Entity, World } from "./types";

export function createWorld() {
  const entityToIndex = new Map<string, number>();
  const entities: string[] = [];
  const components: Component[] = [];
  let disposers: (() => void)[] = [];

  function getEntityIndexStrict(entity: string): number {
    const index = entityToIndex.get(entity);
    if (index == null) throw new Error("entity does not exist");
    return index;
  }

  function registerEntity({ id, idSuffix }: { id?: string; idSuffix?: string } = {}) {
    const entity = id || entities.length + (idSuffix ? "-" + idSuffix : "");
    const index = entities.push(entity) - 1;
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

  function hasEntity(entity: string): boolean {
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
export function getEntityComponents(world: World, entity: Entity): Component[] {
  return world.components.filter((component) => hasComponent(component, entity));
}
