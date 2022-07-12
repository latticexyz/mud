import { HasValue, Has, defineSyncSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { EntityTypes } from "../../../../Network/types";
import { Sprites } from "../../constants";

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
    [HasValue(EntityType, { value: EntityTypes.Hero }), Has(LocalPosition)],
    () => Appearance,
    () => {
      return {
        value: Sprites.Hero,
      };
    }
  );
}
