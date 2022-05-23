import { defineComponent, World } from "@mudkit/recs";

export function defineStrollingComponent(world: World) {
  return defineComponent(world, {}, { name: "Strolling" });
}
