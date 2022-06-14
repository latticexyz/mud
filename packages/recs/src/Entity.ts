import { getEntityComponents } from "./World";
import { setComponent, removeComponent } from "./Component";
import { ComponentWithValue, Entity, Schema, Unpacked, World } from "./types";

export function createEntity<Cs extends Schema[]>(
  world: World,
  components?: ComponentWithValue<Unpacked<Cs>>[],
  options?: { id?: string; idSuffix?: string }
): Entity {
  const entity = world.registerEntity(options ?? {});

  if (components) {
    for (const { component, value } of components) {
      setComponent(component, entity, value);
    }
  }

  return entity;
}

export function removeEntity(world: World, entity: Entity) {
  const components = getEntityComponents(world, entity);
  for (const component of components) {
    removeComponent(component, entity);
  }
}
