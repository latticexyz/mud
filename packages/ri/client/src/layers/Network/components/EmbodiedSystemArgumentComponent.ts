import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineEmbodiedSystemArgumentComponent(world: World) {
  return defineComponent(world, { value: Type.String });
}
