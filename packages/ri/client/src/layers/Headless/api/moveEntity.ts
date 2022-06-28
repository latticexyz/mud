import { getPlayerEntity } from "@latticexyz/std-client";
import { hasComponent, HasValue, setComponent, runQuery, getComponentValue } from "@latticexyz/recs";
import { ActionSystem, HeadlessLayer } from "../types";
import { Coord } from "@latticexyz/utils";

export const Directions = {
  Up: { x: 0, y: -1 },
  Right: { x: 1, y: 0 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
};

export function moveEntity(
  layer: HeadlessLayer,
  actions: ActionSystem,
  entity: number,
  direction: keyof typeof Directions
) {
  const {
    parentLayers: {
      network: {
        personaId,
        components: {
          Position,
          Movable,
          Untraversable,
          CurrentStamina,
          MaxStamina,
          StaminaRegeneration,
          Persona,
          OwnedBy,
        },
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

  // Entity must have sufficient stamina
  const netStamina = getComponentValue(LocalCurrentStamina, entity)?.value;
  if (netStamina == null || netStamina < 1) return;

  const actionID = `move ${Math.random()}`;
  const delta = Directions[direction];

  actions.add({
    id: actionID,
    components: {
      Position,
      Untraversable,
      CurrentStamina,
      MaxStamina,
      StaminaRegeneration,
      LocalCurrentStamina,
    },
    requirement: ({ Position, Untraversable }) => {
      const currentPosition = getComponentValue(Position, entity);
      if (!currentPosition) return null;

      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };

      // Target position must be traversable
      const entities = runQuery([HasValue(Position, targetPosition)]);
      for (const entity of entities) {
        if (hasComponent(Untraversable, entity)) {
          return null;
        }
      }

      return targetPosition;
    },
    updates: (_, targetPosition: Coord) => [
      {
        component: "Position",
        entity: entity,
        value: targetPosition,
      },
    ],
    execute: async (targetPosition: Coord) => {
      const tx = await layer.parentLayers.network.api.moveEntity(world.entities[entity], targetPosition);
      await tx.wait();
      setComponent(LocalCurrentStamina, entity, { value: netStamina });
    },
  });
}
