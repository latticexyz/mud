import {
  Components,
  defineQuery,
  getComponentValueStrict,
  getEntitiesWithValue,
  Has,
  hasComponent,
  Type,
} from "@latticexyz/recs";
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

export function moveEntityFunc(direction: string, network: NetworkLayer, actions: ActionSystem) {
  const { Position, Movable, Untraversable, OwnedBy } = network.components;
  const delta = Directions[direction];
  const player = [...defineQuery([Has(Movable)]).get()][0];
  const actionID = `move ${Math.random()}`;

  actions.add({
    id: actionID,
    components: { Position, Untraversable },
    requirement: ({ Position, Untraversable }) => {
      const currentPosition = getComponentValueStrict(Position, player);
      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };

      // TODO: check untraversable rather than any entity blocking you
      const entities = getEntitiesWithValue(Position, targetPosition);

      if (entities.size > 0) {
        actions.cancel(actionID);
        return null;
      }

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
        entity: player,
        value: { x: data.targetPosition.x, y: data.targetPosition.y },
      },
    ],
    execute: async (data: MoveData) => {
      console.log("Execute action");
      return network.api.moveEntity(player, { x: data.targetPosition.x, y: data.targetPosition.y });
    },
  });
}
