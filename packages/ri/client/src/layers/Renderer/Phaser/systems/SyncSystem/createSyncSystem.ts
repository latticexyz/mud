import { HasValue, Has, defineSyncSystem } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { LocalEntityTypes } from "../../../../Local/types";
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
        components: { EntityType },
      },
      local: {
        components: { LocalEntityType, Selected },
      },
    },
    components: { Appearance, SpriteAnimation, Outline, HueTint },
  } = layer;

  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Hero })],
    () => Appearance,
    () => {
      return {
        value: Assets.Legendary,
      };
    }
  );

  defineSyncSystem(
    world,
    [HasValue(LocalEntityType, { entityType: LocalEntityTypes.Imp })],
    () => Appearance,
    () => ({
      value: Assets.Imp,
    })
  );

  defineSyncSystem(
    world,
    [Has(Selected)],
    () => Outline,
    () => ({ value: true })
  );

  defineSyncSystem(
    world,
    [HasValue(LocalEntityType, { entityType: LocalEntityTypes.Hero })],
    () => HueTint,
    () => ({ value: 0xff0000 })
  );

  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Hero })],
    () => SpriteAnimation,
    () => ({
      value: Animations.HeroIdle,
    })
  );

  defineSyncSystem(
    world,
    [HasValue(LocalEntityType, { entityType: LocalEntityTypes.Imp })],
    () => SpriteAnimation,
    () => ({
      value: Animations.ImpIdle,
    })
  );
}
