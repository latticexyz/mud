import { defineComponent, World } from "@latticexyz/recs";

export function defineStrollingComponent(world: World) {
  return defineComponent(world, {}, { name: "Strolling" });
}
