import {
  getComponentValueStrict,
  Has,
  HasValue,
  defineSyncSystem,
  defineEnterSystem,
  setComponent,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { EntityTypes } from "../../../Network/types";

/**
 * The Sync system handles adding Local layer components to entites based on components they have on parent layers
 */
export function createSyncSystem(layer: LocalLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { EntityType, Position },
      },
    },
    components: { Strolling, LocalPosition, MoveSpeed, Selectable, Name },
  } = layer;

  // Add Strolling component to entities with type Creature
  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Hero })],
    () => Strolling,
    () => ({ value: true })
  );

  // Add LocalPosition to entities with Position of type Creature
  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Hero }), Has(Position)],
    () => LocalPosition,
    (entity) => {
      const pos = getComponentValueStrict(Position, entity);
      return pos;
    }
  );

  // Add MoveSpeed to entities of type Creature
  defineSyncSystem(
    world,
    [HasValue(EntityType, { value: EntityTypes.Hero })],
    () => MoveSpeed,
    () => ({ default: 1000, current: 1000 })
  );

  defineSyncSystem(
    world,
    [Has(EntityType)],
    () => Selectable,
    () => ({ value: true })
  );

  defineEnterSystem(world, [Has(EntityType)], ({ entity, value }) => {
    let name = "Unknown";
    const entityType = value[0]?.value;

    if (entityType === EntityTypes.Hero) {
      name = "Soldier";
    } else if (entityType === EntityTypes.Settlement) {
      name = "Settlement";
    } else if (entityType === EntityTypes.Gold) {
      name = "Gold";
    } else if (entityType === EntityTypes.EmberCrown) {
      name = "EmberCrown";
    } else if (entityType === EntityTypes.EscapePortal) {
      name = "EscapePortal";
    }

    setComponent(Name, entity, { value: name });
  });
}
