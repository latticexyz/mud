import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineOutlineComponent(world: World) {
  return defineComponent(world, { color: Type.OptionalNumber }, { id: "Outline" });
}
