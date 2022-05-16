import { defineComponent, Type, World } from "@mud/recs";

export function definePathComponent(world: World) {
  return defineComponent(world, { x: Type.NumberArray, y: Type.NumberArray }, { name: "Path" });
}
