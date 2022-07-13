import {
  Has,
  defineSyncSystem,
  getComponentValueStrict,
  defineSystem,
  setComponent,
  UpdateType,
  removeComponent,
} from "@latticexyz/recs";
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

  defineSystem(world, [Has(EntityType), Has(LocalPosition)], ({ entity, type }) => {
    const entityType = getComponentValueStrict(EntityType, entity).value;

    if (type === UpdateType.Exit) removeComponent(Appearance, entity);

    setComponent(Appearance, entity, {
      value: EntityTypeSprites[entityType],
    });
  });
}
