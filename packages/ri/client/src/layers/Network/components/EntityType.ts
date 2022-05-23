import { defineComponent, Type, World } from "@mudkit/recs";

export function defineEntityTypeComponent(world: World) {
  return defineComponent(world, { entityType: Type.Number });
}
