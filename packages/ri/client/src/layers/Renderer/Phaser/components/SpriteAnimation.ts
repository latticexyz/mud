import { World, Type, defineComponent } from "@latticexyz/recs";

export function defineSpriteAnimationComponent(world: World) {
  return defineComponent(world, { animation: Type.String }, { name: "SpriteAnimation" });
}
