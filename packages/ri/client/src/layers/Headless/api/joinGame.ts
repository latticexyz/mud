import { WorldCoord } from "@latticexyz/phaserx/src/types";
import { getPlayerEntity } from "@latticexyz/std-client";
import { NetworkLayer } from "../../Network";
import { ActionSystem } from "../types";

export function joinGame(network: NetworkLayer, actions: ActionSystem, targetPosition: WorldCoord) {
  const { Position, Persona } = network.components;

  const actionId = `spawn persona ${network.personaId}`;
  actions.add({
    id: actionId,
    components: { Position, Persona },
    requirement: ({ Persona }) => {
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
      network.api.joinGame(targetPosition);
    },
  });
}
