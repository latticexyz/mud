import { defineComponent, Type, World } from "@mudkit/recs";

export function defineUntraversableComponent(world: World) {
  return defineComponent(world, { traversableBy: Type.EntityArray });
}
