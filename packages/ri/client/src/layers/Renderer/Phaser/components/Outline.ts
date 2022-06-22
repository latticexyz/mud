import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineOutlineComponent(world: World) {
  return defineComponent(world, { value: Type.Boolean }, { id: "Outline" });
}
