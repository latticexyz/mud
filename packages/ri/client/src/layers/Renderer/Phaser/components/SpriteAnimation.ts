import { World, Type, defineComponent } from "@mud/recs";

export function defineSpriteAnimationComponent(world: World) {
  return defineComponent(world, { animation: Type.String });
}
