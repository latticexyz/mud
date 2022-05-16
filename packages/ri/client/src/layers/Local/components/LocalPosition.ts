import { defineComponent, Type, World } from "@mud/recs";

export function defineLocalPositionComponent(world: World) {
  return defineComponent(world, { x: Type.Number, y: Type.Number }, { name: "LocalPosition" });
}
