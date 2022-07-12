import { Has, defineSyncSystem, getComponentValueStrict } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { EntityTypeSprites } from "../../constants";

/**
 * The Sync system handles adding Phaser layer components to entites based on components they have on parent layers
 */
export function createSyncSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { EntityType },
      },
      local: {
        components: { Selected, LocalPosition },
      },
    },
    components: { Appearance, Outline },
  } = layer;

  defineSyncSystem(
    world,
    [Has(Selected)],
    () => Outline,
    () => ({ color: 0xfff000 })
  );

  defineSyncSystem(
    world,
    [Has(EntityType), Has(LocalPosition)],
    () => Appearance,
    (entity) => {
      const entityType = getComponentValueStrict(EntityType, entity).value;

      return {
        value: EntityTypeSprites[entityType],
      };
    }
  );
}
