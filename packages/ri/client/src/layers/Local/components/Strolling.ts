import { defineComponent, World } from "@mud/recs";

export function defineStrollingComponent(world: World) {
  return defineComponent(world, {}, { name: "Strolling" });
}
