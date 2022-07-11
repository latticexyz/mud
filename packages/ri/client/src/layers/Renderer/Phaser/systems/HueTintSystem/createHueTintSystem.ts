import {
  defineSystem,
  getComponentValue,
  getComponentValueStrict,
  Has,
  setComponent,
  UpdateType,
} from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { HueTintAndOutlineFXPipeline } from "@latticexyz/phaserx";
import { getAddressColor } from "@latticexyz/std-client";

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
      network: {
        components: { OwnedBy },
      },
      local: {
        components: { LocalPosition },
      },
    },
  } = layer;

  defineSystem(world, [Has(OwnedBy)], ({ entity }) => {
    const ownedBy = getComponentValue(OwnedBy, entity)?.value;
    if (!ownedBy) {
      setComponent(HueTint, entity, { value: 0xffffff });
      return;
    }

    const ownedByIndex = world.entityToIndex.get(ownedBy);
    if (!ownedByIndex) {
      setComponent(HueTint, entity, { value: 0xffffff });
      return;
    }

    setComponent(HueTint, entity, { value: getAddressColor(ownedBy) });
  });

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
