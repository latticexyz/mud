import { WorldCoord } from "@latticexyz/phaserx/src/types";
import { getEntitiesWithValue } from "@latticexyz/recs";
import { getPlayerEntity } from "@latticexyz/std-client";
import { NetworkLayer } from "../../Network";
import { EntityTypes } from "../../Network/types";
import { ActionSystem } from "../types";

export function joinGame(network: NetworkLayer, actions: ActionSystem, targetPosition: WorldCoord) {
  const { Position, Persona } = network.components;

  const actionId = `spawn ${Math.random()}`;
  actions.add({
    id: actionId,
    components: { Position, Persona },
    requirement: ({ Position, Persona }) => {
      const blockingEntities = getEntitiesWithValue(Position, targetPosition);
      if (blockingEntities.size !== 0) {
        actions.cancel(actionId);
        return null;
      }

      if (!network.personaId) {
        console.warn("No persona ID found, canceling spawn attempt");
        actions.cancel(actionId);
        return null;
      }

      const playerEntity = getPlayerEntity(Persona, network.personaId);
      if (playerEntity) {
        console.warn("Player already spawned, canceling spawn.");
        actions.cancel(actionId);
        return null;
      }

      return true;
    },
    updates: () => [],
    execute: () => {
      console.log(`spawning entityType: ${EntityTypes.Creature} at ${JSON.stringify(targetPosition)}`);
      network.api.joinGame(targetPosition);
    },
  });
}
