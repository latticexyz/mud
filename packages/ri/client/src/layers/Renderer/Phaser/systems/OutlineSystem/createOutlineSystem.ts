import { defineEnterQuery, defineExitQuery, Has, defineReactionSystem } from "@latticexyz/recs";
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

  const enterQuery = defineEnterQuery(world, [Has(Outline)], { runOnInit: true });
  const exitQuery = defineExitQuery(world, [Has(Outline)], { runOnInit: true });

  defineReactionSystem(
    world,
    () => enterQuery.get(),
    (entities) => {
      for (const entity of entities) {
        const embodiedEntity = objectPool.get(entity, "Sprite");
        embodiedEntity.setComponent({
          id: Outline.id,
          once: (gameObject) => {
            gameObject.setPipeline(HueTintAndOutlineFXPipeline.KEY);
            gameObject.setPipelineData("outline", true);
          },
        });
      }
    }
  );
  defineReactionSystem(
    world,
    () => exitQuery.get(),
    (entities) => {
      for (const entity of entities) {
        const embodiedEntity = objectPool.get(entity, "Sprite");
        embodiedEntity.removeComponent(Outline.id);
      }
    }
  );
}
