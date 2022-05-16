import { defineComponent, Type, World } from "@mud/recs";

export function defineUntraversableComponent(world: World) {
  return defineComponent(world, { traversableBy: Type.EntityArray });
}
