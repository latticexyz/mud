import { hasComponent } from "./Component";
import { Component, Entity, World } from "./types";

export function createWorld() {
  const entityToIndex = new Map<string, number>();
  const entities: string[] = [];
  const components: Component[] = [];

  function registerEntity({ id, idSuffix }: { id?: string; idSuffix?: string } = {}) {
    const entity = id || entities.length + (idSuffix ? "-" + idSuffix : "");
    const index = entities.push(entity) - 1;
    entityToIndex.set(entity, index);
    return index;
  }

  function registerComponent(component: Component) {
    components.push(component);
  }

  return { entities, entityToIndex, registerEntity, components, registerComponent };
}

// Design decision: don't store a list of components for each entity but compute it dynamically when needed
// because there are less components than entities and maintaining a list of components per entity is a large overhead
export function getEntityComponents(world: World, entity: Entity): Component[] {
  return world.components.filter((component) => hasComponent(component, entity));
}
