import { HasValue, Has, defineSyncSystem, getComponentValue, defineSystem, setComponent } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { EntityTypes } from "../../../../Network/types";
import { Animations, Assets } from "../../constants";

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
    [Has(EntityType), Has(LocalPosition)],
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

  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Settlement }), Has(LocalPosition)],
    () => SpriteAnimation,
    () => ({
      value: Animations.SettlementIdle,
    })
  );
}
