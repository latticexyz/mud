import { getPlayerEntity } from "@latticexyz/std-client";
import {
  hasComponent,
  HasValue,
  setComponent,
  runQuery,
  getComponentValue,
  EntityIndex,
  EntityID,
} from "@latticexyz/recs";
import { ActionSystem, HeadlessLayer } from "../types";
import { Direction, Directions } from "../../../constants";

export function moveEntity(layer: HeadlessLayer, actions: ActionSystem, entity: EntityIndex, direction: Direction) {
  const {
    parentLayers: {
      network: {
        personaId,
        components: { Position, Movable, Untraversable, Persona, OwnedBy },
      },
    },
    world,
    components: { LocalCurrentStamina },
  } = layer;

  if (personaId == null) {
    return console.warn("Persona ID not found.");
  }

  // Entity must be movable
  const entityCanMove = getComponentValue(Movable, entity)?.value;
  if (!entityCanMove) return;

  // Entity must be owned by the player
  const movingEntityOwner = getComponentValue(OwnedBy, entity)?.value;
  const playerEntityIndex = getPlayerEntity(Persona, personaId);
  if (movingEntityOwner !== world.entities[playerEntityIndex]) return;

  const actionID = `move ${Math.random()}` as EntityID;
  const delta = Directions[direction];

  actions.add({
    id: actionID,
    components: {
      Position,
      Untraversable,
      LocalCurrentStamina,
    },
    requirement: ({ Position, Untraversable, LocalCurrentStamina }) => {
      let netStamina = getComponentValue(LocalCurrentStamina, entity)?.value;
      if (!netStamina) {
        actions.cancel(actionID);
        return null;
      }

      netStamina -= 1;
      if (netStamina < 0) {
        actions.cancel(actionID);
        return null;
      }

      const currentPosition = getComponentValue(Position, entity);
      if (!currentPosition) {
        actions.cancel(actionID);
        return null;
      }

      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };

      // Target position must be traversable
      const entities = runQuery([HasValue(Position, targetPosition)]);
      for (const entity of entities) {
        if (hasComponent(Untraversable, entity)) {
          actions.cancel(actionID);
          return null;
        }
      }

      return {
        targetPosition,
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
        component: "LocalCurrentStamina",
        entity,
        value: { value: netStamina },
      },
    ],
    execute: async ({ targetPosition, netStamina }) => {
      const tx = await layer.parentLayers.network.api.moveEntity(world.entities[entity], targetPosition);
      await tx.wait();
      setComponent(LocalCurrentStamina, entity, { value: netStamina });
    },
  });
}
