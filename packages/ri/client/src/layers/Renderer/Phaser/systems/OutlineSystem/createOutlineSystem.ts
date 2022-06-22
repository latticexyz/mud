import { defineComponentSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { HueTintAndOutlineFXPipeline } from "@latticexyz/phaserx";

/**
 * The Outline system handles setting an "outline" pipeline data on game objects having an outline
 */
export function createOutlineSystem(layer: PhaserLayer) {
  const {
    world,
    components: { Outline },
    scenes: {
      Main: { objectPool },
    },
  } = layer;

  defineComponentSystem(world, Outline, ({ entity, value }) => {
    const outline = value[0]?.value;
    const embodiedEntity = objectPool.get(entity, "Sprite");

    if (!outline) {
      return embodiedEntity.removeComponent(Outline.id);
    }

    embodiedEntity.setComponent({
      id: Outline.id,
      once: (gameObject) => {
        gameObject.setPipeline(HueTintAndOutlineFXPipeline.KEY);
        gameObject.setPipelineData("outline", true);
      },
    });
  });
}
