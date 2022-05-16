import { defineComponent, Type, World } from "@mud/recs";

export function defineEntityTypeComponent(world: World) {
  return defineComponent(world, { entityType: Type.Number });
}
