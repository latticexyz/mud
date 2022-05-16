import { defineAutorunSystem, defineUpdateQuery, getComponentValueStrict, Has } from "@mud/recs";
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
  const entities = defineUpdateQuery(world, [Has(Appearance)], { runOnInit: true });
  return defineAutorunSystem(world, () => {
    for (const entity of entities.get()) {
      const { texture } = getComponentValueStrict(Appearance, entity);
      const embodiedEntity = objectPool.get(entity, "Sprite");
      embodiedEntity.setComponent({
        id: Appearance.id,
        once: (gameObject) => {
          gameObject.setTexture(texture);
        },
      });
    }
  });
}
