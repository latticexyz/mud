import { defineUpdateQuery, defineExitQuery, Has, defineReactionSystem, getComponentValue } from "@mud/recs";
import { PhaserLayer } from "../../types";
import { HueTintAndOutlineFXPipeline } from "@mud/phaserx";

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

  const updateQuery = defineUpdateQuery(world, [Has(HueTint)], { runOnInit: true });
  const exitQuery = defineExitQuery(world, [Has(HueTint)], { runOnInit: true });

  defineReactionSystem(
    world,
    () => updateQuery.get(),
    (entities) => {
      for (const entity of entities) {
        const value = getComponentValue(HueTint, entity);
        if (!value) return;
        const embodiedEntity = objectPool.get(entity, "Sprite");
        embodiedEntity.setComponent({
          id: HueTint.id,
          once: (gameObject) => {
            gameObject.setPipeline(HueTintAndOutlineFXPipeline.KEY);
            gameObject.setPipelineData("hueTint", value.hueTint);
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
        embodiedEntity.removeComponent(HueTint.id);
      }
    }
  );
}
