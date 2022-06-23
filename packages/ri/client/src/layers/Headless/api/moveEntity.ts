import { getPlayerEntity } from "@latticexyz/std-client";
import { getComponentValueStrict, Has, hasComponent, HasValue, setComponent, Type, runQuery } from "@latticexyz/recs";
import { ActionSystem, HeadlessLayer } from "../types";

const Directions: { [key: string]: { x: number; y: number } } = {
  Up: { x: 0, y: -1 },
  Right: { x: 1, y: 0 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
};

interface MoveData {
  action: string;
  targetPosition: { x: Type.Number; y: Type.Number };
  netStamina: number;
  targetEntity?: string;
}

export function moveEntity(layer: HeadlessLayer, actions: ActionSystem, direction: string) {
  const networkLayer = layer.parentLayers.network;
  if (!networkLayer.personaId) {
    console.warn("Persona ID not found.");
    return;
  }

  const world = layer.world;

  const { Position, Movable, Untraversable, CurrentStamina, MaxStamina, StaminaRegeneration, Persona, OwnedBy } =
    networkLayer.components;
  const { LocalCurrentStamina } = layer.components;

  const playerEntity = getPlayerEntity(Persona, networkLayer.personaId);
  const delta = Directions[direction];
  const playerCharacter = runQuery([HasValue(OwnedBy, { value: world.entities[playerEntity] }), Has(Movable)]);
  if (playerCharacter.size === 0) throw new Error("Player not found");
  if (playerCharacter.size > 1) throw new Error("More than one player character found. Something is very wrong.");

  const character = [...playerCharacter][0];

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
      const currentPosition = getComponentValueStrict(Position, character);
      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };
      const netStamina = getComponentValueStrict(LocalCurrentStamina, character).value - 1;

      if (netStamina < 0) {
        actions.cancel(actionID);
        return null;
      }

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
        entity: character,
        value: { x: data.targetPosition.x, y: data.targetPosition.y },
      },
      {
        component: "LocalCurrentStamina",
        entity: character,
        value: { value: data.netStamina },
      },
    ],
    execute: async (data: MoveData) => {
      console.log("Execute action");
      const tx = await layer.parentLayers.network.api.moveEntity(world.entities[character], {
        x: data.targetPosition.x,
        y: data.targetPosition.y,
      });
      await tx.wait();
      setComponent(LocalCurrentStamina, character, { value: data.netStamina });
    },
  });
}
