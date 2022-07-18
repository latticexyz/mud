import { defineComponent, World, Type } from "@latticexyz/recs";

export function defineActionComponent(world: World) {
  return defineComponent(world, { state: Type.Number, on: Type.OptionalEntity }, { id: "Action" });
}
