import { defineComponentSystem, defineSystem, getComponentValueStrict, Has, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

/**
 * The Appearance system handles setting textures of phaser game objects based on their Appearance component
 */
export function createAppearanceSystem(layer: PhaserLayer) {
  const {
    world,
    components: { Appearance },
    scenes: {
      Main: { objectPool },
    },
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
    },
  } = layer;

  defineSystem(world, [Has(Appearance), Has(LocalPosition)], ({ entity, type }) => {
    if (type === UpdateType.Exit) {
      return objectPool.remove(entity);
    }

    const appearance = getComponentValueStrict(Appearance, entity);
    const embodiedEntity = objectPool.get(entity, "Sprite");
    embodiedEntity.setComponent({
      id: Appearance.id,
      once: (gameObject) => {
        gameObject.setTexture(appearance.value);
      },
    });
  });
}
