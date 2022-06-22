import { getComponentValueStrict, Has, hasComponent, HasValue, Type, runQuery } from "@latticexyz/recs";
import { getPlayerEntity } from "@latticexyz/std-client";
import { createNetworkLayer, NetworkLayer } from "../../Network";
import { ActionSystem } from "../types";

const Directions: { [key: string]: { x: number; y: number } } = {
  Up: { x: 0, y: -1 },
  Right: { x: 1, y: 0 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
};

interface MoveData {
  action: string;
  targetPosition: { x: Type.Number; y: Type.Number };
  targetEntity?: string;
}

export function moveEntity(network: NetworkLayer, actions: ActionSystem, direction: string) {
  if (!network.personaId) {
    console.warn("Persona ID not found.");
    return;
  }

  const { Position, Movable, Untraversable, OwnedBy, Persona } = network.components;

  const playerEntity = getPlayerEntity(Persona, network.personaId);
  const delta = Directions[direction];
  const playerCharacter = runQuery([HasValue(OwnedBy, { value: network.world.entities[playerEntity] }), Has(Movable)]);
  if (playerCharacter.size === 0) throw new Error("Player not found");
  if (playerCharacter.size > 1) throw new Error("More than one player character found. Something is very wrong.");

  const character = [...playerCharacter][0];

  const actionID = `move ${Math.random()}`;

  actions.add({
    id: actionID,
    components: { Position, Untraversable },
    requirement: ({ Position, Untraversable }) => {
      const currentPosition = getComponentValueStrict(Position, character);
      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };

      const entities = runQuery([HasValue(Position, targetPosition)]);
      for (const entity of entities) {
        if (hasComponent(Untraversable, entity)) {
          actions.cancel(actionID);
          return null;
        }
      }

      return { action: "Position", targetPosition: targetPosition };
    },
    updates: (_, data: MoveData) => [
      {
        component: "Position",
        entity: character,
        value: { x: data.targetPosition.x, y: data.targetPosition.y },
      },
    ],
    execute: async (data: MoveData) => {
      console.log("Execute action");
      return network.api.moveEntity(network.world.entities[character], {
        x: data.targetPosition.x,
        y: data.targetPosition.y,
      });
    },
  });
}
