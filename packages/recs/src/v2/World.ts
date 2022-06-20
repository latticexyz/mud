import { Component } from "./types";

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
