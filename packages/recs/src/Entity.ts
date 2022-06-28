import { setComponent } from "./Component";
import { Component, ComponentValue, EntityID, EntityIndex, World } from "./types";

export function createEntity(
  world: World,
  components?: [Component, ComponentValue][],
  options?: { id?: EntityID; idSuffix?: string }
): EntityIndex {
  const entity = world.registerEntity(options ?? {});

  if (components) {
    for (const [component, value] of components) {
      setComponent(component, entity, value);
    }
  }

  return entity;
}
