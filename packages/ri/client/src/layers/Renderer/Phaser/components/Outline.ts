import { defineComponent, World } from "@latticexyz/recs";

export function defineOutlineComponent(world: World) {
  return defineComponent(world, {}, { name: "Outline" });
}
