import { defineUpdateQuery, Has, defineReactionSystem, getComponentValueStrict } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

/**
 * The Appearance system handles setting textures of phaser game objects based on their Appearance component
 */
export function createSpriteAnimationSystem(layer: PhaserLayer) {
  const {
    world,
    components: { SpriteAnimation },
    scenes: {
      Main: { objectPool },
    },
  } = layer;

  const query = defineUpdateQuery(world, [Has(SpriteAnimation)], { runOnInit: true });

  return defineReactionSystem(
    world,
    () => query.get(),
    (entities) => {
      for (const entity of entities) {
        const { animation } = getComponentValueStrict(SpriteAnimation, entity);
        const embodiedEntity = objectPool.get(entity, "Sprite");
        embodiedEntity.setComponent({
          id: SpriteAnimation.id,
          once: (gameObject) => {
            gameObject.play(animation);
          },
        });
      }
    }
  );
}
