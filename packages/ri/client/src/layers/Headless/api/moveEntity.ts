import { getPlayerEntity } from "@latticexyz/std-client";
import {
  hasComponent,
  HasValue,
  runQuery,
  getComponentValue,
  EntityIndex,
  EntityID,
  setComponent,
} from "@latticexyz/recs";
import { ActionSystem, HeadlessLayer } from "../types";
import { WorldCoord } from "../../../types";
import { aStar } from "../../../../src/utils/pathfinding";

export function moveEntity(
  layer: HeadlessLayer,
  actions: ActionSystem,
  entity: EntityIndex,
  targetPosition: WorldCoord
) {
  const {
    parentLayers: {
      network: {
        personaId,
        components: { Position, Movable, Untraversable, Persona, OwnedBy },
      },
    },
    world,
    components: { LocalStamina },
  } = layer;

  if (personaId == null) {
    return console.warn("Persona ID not found.");
  }

  // Entity must be movable
  const moveSpeed = getComponentValue(Movable, entity)?.value;
  if (!moveSpeed) return;

  // Entity must be owned by the player
  const movingEntityOwner = getComponentValue(OwnedBy, entity)?.value;
  const playerEntityIndex = getPlayerEntity(Persona, personaId);
  if (movingEntityOwner !== world.entities[playerEntityIndex]) return;

  const actionID = `move ${Math.random()}` as EntityID;

  actions.add({
    id: actionID,
    components: {
      Position,
      Untraversable,
      LocalStamina,
    },
    requirement: ({ Position, Untraversable, LocalStamina }) => {
      const localStamina = getComponentValue(LocalStamina, entity);
      if (!localStamina) {
        actions.cancel(actionID);
        return null;
      }
      const netStamina = localStamina.current - 1;
      if (netStamina < 0) {
        actions.cancel(actionID);
        return null;
      }

      const currentPosition = getComponentValue(Position, entity);
      if (!currentPosition) {
        actions.cancel(actionID);
        return null;
      }

      const path = aStar(currentPosition, targetPosition, moveSpeed + 1, layer.parentLayers.network, Position);
      if (path.length == 0) {
        actions.cancel(actionID);
        return null;
      }

      return {
        targetPosition,
        path,
        netStamina,
      };
    },
    updates: (_, { targetPosition, netStamina }) => [
      {
        component: "Position",
        entity: entity,
        value: targetPosition,
      },
      {
        component: "LocalStamina",
        entity,
        value: { current: netStamina },
      },
    ],
    execute: async ({ path, netStamina }) => {
      const tx = await layer.parentLayers.network.api.moveEntity(world.entities[entity], path);
      await tx.wait();
      setComponent(LocalStamina, entity, { current: netStamina });
    },
  });
}
