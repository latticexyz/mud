import { WorldCoord } from "@latticexyz/phaserx/src/types";
import { EntityType, Components, getEntitiesWithValue } from "@latticexyz/recs";
import { NetworkLayer } from "../../Network";
import { ActionSystem } from "../types";

export function spawnCreatureFunc(
  targetPosition: WorldCoord,
  entityType: EntityType,
  network: NetworkLayer,
  actions: ActionSystem
) {
  const { Position, Movable } = network.components;
  // if (getQueryResult([Has(Movable)]).size != 0) {
  //   return;
  // }
  actions.add({
    id: `spawn ${entityType}`,
    components: { Position, Movable },
    requirement: ({ Position, Movable }) => {
      // if (getQueryResult([Has(Movable)]).size != 0) {
      //   return null;
      // }
      // const entities = getEntitiesWithValue(Position, targetPosition);

      // if (entities.size == 0) return true;
      return true;
    },
    updates: () => [],
    execute: () => {
      console.log(`spawning ${entityType} at ${targetPosition}`);
      network.api.spawnCreature(targetPosition, entityType);
    },
  });
}
