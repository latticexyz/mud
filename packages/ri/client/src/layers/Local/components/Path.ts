import { defineComponent, Type, World } from "@mudkit/recs";

export function definePathComponent(world: World) {
  return defineComponent(world, { x: Type.NumberArray, y: Type.NumberArray }, { name: "Path" });
}
