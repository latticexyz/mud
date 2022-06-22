import { defineComponentSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";

/**
 * The Appearance system handles setting textures of phaser game objects based on their Appearance component
 */
export function createAppearanceSystem(layer: PhaserLayer) {
  const {
    world,
    components: { Appearance },
    scenes,
  } = layer;
  const objectPool = scenes.Main.objectPool;

  defineComponentSystem(world, Appearance, ({ entity, value }) => {
    const appearance = value[0];

    if (!appearance) {
      return objectPool.remove(entity);
    }

    const embodiedEntity = objectPool.get(entity, "Sprite");
    embodiedEntity.setComponent({
      id: Appearance.id,
      once: (gameObject) => {
        gameObject.setTexture(appearance.texture);
        gameObject.setOrigin(0, 0);
      },
    });
  });
}
