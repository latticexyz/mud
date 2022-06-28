import { HasValue, Has, defineSyncSystem, getComponentValue } from "@latticexyz/recs";
import { PhaserLayer } from "../../types";
import { LocalEntityTypes } from "../../../../Local/types";
import { EntityTypes } from "../../../../Network/types";
import { Animations, Assets } from "../../constants";
import { getPersonaColor } from "@latticexyz/std-client";

/**
 * The Sync system handles adding Phaser layer components to entites based on components they have on parent layers
 */
export function createSyncSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { EntityType, Persona, OwnedBy },
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

      const ownerPersonaId = getComponentValue(Persona, ownedByIndex)?.value;
      if (!ownerPersonaId) return { value: 0xff0000 };

      const personaColor = getPersonaColor(ownerPersonaId);
      return { value: personaColor };
    }
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
