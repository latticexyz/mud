import { WorldCoord } from "@latticexyz/phaserx/src/types";
import { getEntitiesWithValue, getQueryResult, Has } from "@latticexyz/recs";
import { NetworkLayer } from "../../Network";
import { EntityTypes } from "../../Network/types";
import { ActionSystem } from "../types";

export function spawnCreature(network: NetworkLayer, actions: ActionSystem, targetPosition: WorldCoord) {
  const { Position, Movable } = network.components;

  actions.add({
    id: `spawn ${Math.random()}`,
    components: { Position, Movable },
    requirement: ({ Position, Movable }) => {
      if (getQueryResult([Has(Movable)]).size != 0) {
        return null;
      }
      const entities = getEntitiesWithValue(Position, targetPosition);

      if (entities.size == 0) return true;
      return true;
    },
    updates: () => [],
    execute: () => {
      console.log(`spawning entityType: ${EntityTypes.Creature} at ${targetPosition}`);
      network.api.spawnCreature(targetPosition, EntityTypes.Creature);
    },
  });
}
