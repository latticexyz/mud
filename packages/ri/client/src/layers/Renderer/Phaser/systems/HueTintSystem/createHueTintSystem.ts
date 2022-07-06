import { defineSystem, getComponentValueStrict, Has, UpdateType } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { HueTintAndOutlineFXPipeline } from "@latticexyz/phaserx";

/**
 * The HueTint system handles setting a "hueTint" pipeline data on game objects having a hue tint
 */
export function createHueTintSystem(layer: PhaserLayer) {
  const {
    world,
    components: { HueTint },
    scenes: {
      Main: { objectPool },
    },
    parentLayers: {
      local: {
        components: { LocalPosition },
      },
    },
  } = layer;

  defineSystem(world, [Has(HueTint), Has(LocalPosition)], ({ entity, type }) => {
    const embodiedEntity = objectPool.get(entity, "Sprite");

    if (type === UpdateType.Exit) {
      return embodiedEntity.removeComponent(HueTint.id);
    }

    const hueTint = getComponentValueStrict(HueTint, entity).value;
    embodiedEntity.setComponent({
      id: HueTint.id,
      once: (gameObject) => {
        gameObject.setPipeline(HueTintAndOutlineFXPipeline.KEY);
        gameObject.setPipelineData("hueTint", hueTint);
      },
    });
  });
}
