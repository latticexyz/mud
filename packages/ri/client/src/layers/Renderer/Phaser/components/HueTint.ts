import { defineComponent, Type, World } from "@mud/recs";

export function defineHueTintComponent(world: World) {
  return defineComponent(world, { hueTint: Type.Number });
}
