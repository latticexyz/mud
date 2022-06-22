import { setComponent } from "./Component";
import { Component, ComponentValue, Entity, World } from "./types";

export function createEntity(
  world: World,
  components?: [Component, ComponentValue][],
  options?: { id?: string; idSuffix?: string }
): Entity {
  const entity = world.registerEntity(options ?? {});

  if (components) {
    for (const [component, value] of components) {
      setComponent(component, entity, value);
    }
  }

  return entity;
}
