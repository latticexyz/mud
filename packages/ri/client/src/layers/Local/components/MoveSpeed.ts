import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineMoveSpeedComponent(world: World) {
  return defineComponent(world, { default: Type.Number, current: Type.Number }, { name: "MoveSpeed" });
}
