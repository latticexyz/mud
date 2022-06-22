import { defineQuery, getComponentValueStrict, Has, hasComponent, HasValue, Type, ProxyExpand } from "@latticexyz/recs";
import { getPlayerEntity } from "@latticexyz/std-client";
import { NetworkLayer } from "../../Network";
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
  const playerCharacterQuery = defineQuery([
    ProxyExpand(OwnedBy, 2),
    HasValue(OwnedBy, { value: playerEntity }),
    Has(Movable),
  ]);
  const characterQueryResult = playerCharacterQuery.get();
  if (characterQueryResult.size === 0) throw new Error("Player not found");
  if (characterQueryResult.size > 1) throw new Error("More than one player character found. Something is very wrong.");
  const character = [...characterQueryResult][0];

  const actionID = `move ${Math.random()}`;

  actions.add({
    id: actionID,
    components: { Position, Untraversable },
    requirement: ({ Position, Untraversable }) => {
      const currentPosition = getComponentValueStrict(Position, character);
      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };

      const entities = [...defineQuery([HasValue(Position, targetPosition)]).get()];
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
      return network.api.moveEntity(character, { x: data.targetPosition.x, y: data.targetPosition.y });
    },
  });
}
