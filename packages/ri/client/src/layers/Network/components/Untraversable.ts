import { defineComponent, Type, World } from "@latticexyz/recs";

export function defineUntraversableComponent(world: World) {
  return defineComponent(world, { traversableBy: Type.EntityArray });
}
