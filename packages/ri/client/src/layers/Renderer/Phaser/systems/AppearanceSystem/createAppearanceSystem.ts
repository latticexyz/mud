import { defineSystem, getComponentValueStrict, Has, UpdateType } from "@latticexyz/recs";
import { Sprites } from "../../constants";
import { PhaserLayer } from "../../types";

/**
 * The Appearance system handles setting textures of phaser game objects based on their Appearance component
 */
export function createAppearanceSystem(layer: PhaserLayer) {
  const {
    world,
    components: { Appearance },
    scenes: {
      Main: { objectPool, config },
    },
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
    },
  } = layer;

  defineSystem(world, [Has(Appearance), Has(LocalPosition)], ({ entity, type }) => {
    if ([UpdateType.Enter, UpdateType.Update].includes(type)) {
      const appearance = getComponentValueStrict(Appearance, entity);
      const sprite = config.sprites[appearance.value as Sprites];
      const embodiedEntity = objectPool.get(entity, "Sprite");
      embodiedEntity.setComponent({
        id: Appearance.id,
        once: (gameObject) => {
          gameObject.setTexture(sprite.assetKey, sprite.frame);
        },
      });
    }
  });
}
