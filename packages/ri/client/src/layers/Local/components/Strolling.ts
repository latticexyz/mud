import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineStrollingComponent(world: World) {
  return defineComponent(world, { value: Type.Boolean }, { id: "Strolling" });
}
