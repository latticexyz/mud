import { defineComponent, Type, World } from "@mudkit/recs";

export function defineEmbodiedSystemArgumentComponent(world: World) {
  return defineComponent(world, { value: Type.String });
}
