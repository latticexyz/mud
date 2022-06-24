import { getPlayerEntity } from "@latticexyz/std-client";
import {
  getComponentValueStrict,
  hasComponent,
  HasValue,
  setComponent,
  Type,
  runQuery,
  getComponentValue,
} from "@latticexyz/recs";
import { ActionSystem, HeadlessLayer } from "../types";

export const Directions = {
  Up: { x: 0, y: -1 },
  Right: { x: 1, y: 0 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
};

interface MoveData {
  action: string;
  targetPosition: { x: Type.Number; y: Type.Number };
}

export function moveEntity(
  layer: HeadlessLayer,
  actions: ActionSystem,
  entity: number,
  direction: keyof typeof Directions
) {
  const networkLayer = layer.parentLayers.network;
  if (!networkLayer.personaId) {
    console.warn("Persona ID not found.");
    return;
  }

  const world = layer.world;

  const { Position, Movable, Untraversable, CurrentStamina, MaxStamina, StaminaRegeneration, Persona, OwnedBy } =
    networkLayer.components;
  const { LocalCurrentStamina } = layer.components;

  const playerEntityIndex = getPlayerEntity(Persona, networkLayer.personaId);
  const delta = Directions[direction];

  const entityCanMove = getComponentValue(Movable, entity)?.value;
  if (!entityCanMove) return;

  const movingEntityOwner = getComponentValue(OwnedBy, entity)?.value;
  if (movingEntityOwner !== world.entities[playerEntityIndex]) return;

  const netStamina = getComponentValueStrict(LocalCurrentStamina, entity).value - 1;
  if (netStamina < 0) return;

  const actionID = `move ${Math.random()}`;

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
      const currentPosition = getComponentValueStrict(Position, entity);
      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };

      const entities = runQuery([HasValue(Position, targetPosition)]);
      for (const entity of entities) {
        if (hasComponent(Untraversable, entity)) {
          actions.cancel(actionID);
          return null;
        }
      }

      return { action: "Position", targetPosition: targetPosition, netStamina };
    },
    updates: (_, data: MoveData) => [
      {
        component: "Position",
        entity: entity,
        value: { x: data.targetPosition.x, y: data.targetPosition.y },
      },
    ],
    execute: async (data: MoveData) => {
      console.log("Execute action");
      const tx = await layer.parentLayers.network.api.moveEntity(world.entities[entity], {
        x: data.targetPosition.x,
        y: data.targetPosition.y,
      });
      await tx.wait();
      setComponent(LocalCurrentStamina, entity, { value: netStamina });
    },
  });
}
