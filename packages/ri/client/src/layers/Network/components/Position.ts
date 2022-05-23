import { defineComponent, Type, World } from "@mudkit/recs";

export function definePositionComponent(world: World) {
  return defineComponent(world, { x: Type.Number, y: Type.Number });
}
