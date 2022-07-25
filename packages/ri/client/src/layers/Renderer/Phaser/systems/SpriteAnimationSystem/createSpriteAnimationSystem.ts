import { defineSystem, getComponentValueStrict, Has, UpdateType } from "@latticexyz/recs";
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
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
    },
  } = layer;

  defineSystem(world, [Has(SpriteAnimation), Has(LocalPosition)], ({ entity, type }) => {
    const embodiedEntity = objectPool.get(entity, "Sprite");

    if (type === UpdateType.Exit) {
      embodiedEntity.removeComponent(SpriteAnimation.id);
      return embodiedEntity.despawn();
    }

    const animation = getComponentValueStrict(SpriteAnimation, entity).value;
    embodiedEntity.setComponent({
      id: SpriteAnimation.id,
      once: (gameObject) => {
        gameObject.play(animation);
      },
    });
  });
}
