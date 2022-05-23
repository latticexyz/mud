import { defineComponent, Type, World } from "@mudkit/recs";

export function defineAppearanceComponent(world: World) {
  return defineComponent(world, { texture: Type.String });
}
