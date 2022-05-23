import { defineComponent, Type, World } from "@mudkit/recs";

export function defineHueTintComponent(world: World) {
  return defineComponent(world, { hueTint: Type.Number });
}
