import { defineComponent, Type, World } from "@mud/recs";

export function defineAppearanceComponent(world: World) {
  return defineComponent(world, { texture: Type.String });
}
