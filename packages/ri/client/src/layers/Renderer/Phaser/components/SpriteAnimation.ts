import { World, Type, defineComponent } from "@mudkit/recs";

export function defineSpriteAnimationComponent(world: World) {
  return defineComponent(world, { animation: Type.String });
}
