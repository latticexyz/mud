import { defineComponent, Type, World } from "@mud/recs";

export function defineMoveSpeedComponent(world: World) {
  return defineComponent(world, { default: Type.Number, current: Type.Number }, { name: "MoveSpeed" });
}
