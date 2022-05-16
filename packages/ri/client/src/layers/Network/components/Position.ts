import { defineComponent, Type, World } from "@mud/recs";

export function definePositionComponent(world: World) {
  return defineComponent(world, { x: Type.Number, y: Type.Number });
}
