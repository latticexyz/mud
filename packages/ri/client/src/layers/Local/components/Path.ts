import { defineComponent, Type, World } from "@latticexyz/recs";

export function definePathComponent(world: World) {
  return defineComponent(world, { x: Type.NumberArray, y: Type.NumberArray }, { id: "Path" });
}
