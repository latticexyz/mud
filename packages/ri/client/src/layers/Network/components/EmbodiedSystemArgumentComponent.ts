import { defineComponent, Type, World } from "@mud/recs";

export function defineEmbodiedSystemArgumentComponent(world: World) {
  return defineComponent(world, { value: Type.String });
}
