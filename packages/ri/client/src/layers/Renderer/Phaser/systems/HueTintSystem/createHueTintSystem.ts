import { defineComponentSystem } from "@latticexyz/recs";
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
  } = layer;

  defineComponentSystem(world, HueTint, ({ entity, value }) => {
    const embodiedEntity = objectPool.get(entity, "Sprite");
    const hueTint = value[0]?.value;

    if (hueTint == null) {
      return embodiedEntity.removeComponent(HueTint.id);
    }

    embodiedEntity.setComponent({
      id: HueTint.id,
      once: (gameObject) => {
        gameObject.setPipeline(HueTintAndOutlineFXPipeline.KEY);
        gameObject.setPipelineData("hueTint", hueTint);
      },
    });
  });
}
