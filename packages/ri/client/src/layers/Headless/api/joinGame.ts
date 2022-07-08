import { WorldCoord } from "@latticexyz/phaserx/src/types";
import { EntityID } from "@latticexyz/recs";
import { NetworkLayer } from "../../Network";
import { ActionSystem } from "../systems";

export function joinGame(network: NetworkLayer, actions: ActionSystem, targetPosition: WorldCoord) {
  const { Player } = network.components;

  const actionId = `spawn ${Math.random()}` as EntityID;
  actions.add({
    id: actionId,
    components: { Player },
    requirement: ({ Player }) => {
      // const playerEntity = getPlayerEntity(Persona, network.personaId);
      // if (playerEntity) {
      //   console.warn("Player already spawned, canceling spawn.");
      //   actions.cancel(actionId);
      //   return null;
      // }

      return true;
    },
    updates: () => [],
    execute: () => {
      network.api.joinGame(targetPosition);
    },
  });
}
