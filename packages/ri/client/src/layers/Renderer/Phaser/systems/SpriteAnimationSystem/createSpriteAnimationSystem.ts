import { defineComponentSystem } from "@latticexyz/recs";
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

  defineComponentSystem(world, SpriteAnimation, ({ entity, value }) => {
    const animation = value[0]?.animation;
    const embodiedEntity = objectPool.get(entity, "Sprite");

    if (!animation) {
      return embodiedEntity.removeComponent(SpriteAnimation.id);
    }

    embodiedEntity.setComponent({
      id: SpriteAnimation.id,
      once: (gameObject) => {
        gameObject.play(animation);
      },
    });
  });
}
