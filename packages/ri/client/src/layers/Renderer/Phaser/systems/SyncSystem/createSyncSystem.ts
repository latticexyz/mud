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
import { UnitTypeSprites, StructureTypeSprites, ItemTypeSprites } from "../../constants";

/**
 * The Sync system handles adding Phaser layer components to entites based on components they have on parent layers
 */
export function createSyncSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { UnitType, StructureType, ItemType },
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

  defineSystem(world, [Has(UnitType), Has(LocalPosition)], ({ entity, type }) => {
    const entityType = getComponentValueStrict(UnitType, entity).value;

    if (type === UpdateType.Exit) removeComponent(Appearance, entity);

    setComponent(Appearance, entity, {
      value: UnitTypeSprites[entityType],
    });
  });

  defineSystem(world, [Has(StructureType), Has(LocalPosition)], ({ entity, type }) => {
    const entityType = getComponentValueStrict(StructureType, entity).value;

    if (type === UpdateType.Exit) removeComponent(Appearance, entity);

    setComponent(Appearance, entity, {
      value: StructureTypeSprites[entityType],
    });
  });

  defineSystem(world, [Has(ItemType), Has(LocalPosition)], ({ entity, type }) => {
    const entityType = getComponentValueStrict(ItemType, entity).value;

    if (type === UpdateType.Exit) removeComponent(Appearance, entity);

    setComponent(Appearance, entity, {
      value: ItemTypeSprites[entityType],
    });
  });
}
