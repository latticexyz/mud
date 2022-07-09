import { HasValue, Has, defineSyncSystem, getComponentValue, defineSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { LocalEntityTypes } from "../../../../Local/types";
import { EntityTypes } from "../../../../Network/types";
import { Animations, Assets } from "../../constants";
import { getAddressColor } from "@latticexyz/std-client";

/**
 * The Sync system handles adding Phaser layer components to entites based on components they have on parent layers
 */
export function createSyncSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { EntityType, OwnedBy },
      },
      local: {
        components: { Selected, LocalPosition },
      },
    },
    components: { Appearance, SpriteAnimation, Outline, HueTint },
  } = layer;

  defineSyncSystem(
    world,
    [Has(Selected), Has(OwnedBy)],
    () => Outline,
    () => ({ color: 0xfff000 })
  );

  defineSyncSystem(
    world,
    [Has(OwnedBy)],
    () => HueTint,
    (entity) => {
      const ownedBy = getComponentValue(OwnedBy, entity)?.value;
      if (!ownedBy) return { value: 0xff0000 };

      const ownedByIndex = world.entityToIndex.get(ownedBy);
      if (!ownedByIndex) return { value: 0xff0000 };

      return { value: getAddressColor(ownedBy) };
    }
  );

  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Hero }), Has(LocalPosition)],
    () => Appearance,
    () => {
      return {
        value: Assets.Legendary,
      };
    }
  );

  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Hero }), Has(LocalPosition)],
    () => SpriteAnimation,
    () => ({
      value: Animations.HeroIdle,
    })
  );
}
