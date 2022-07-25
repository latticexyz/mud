import { EntityID, EntityIndex, hasComponent } from "@latticexyz/recs";
import { NetworkLayer } from "../../Network";
import { ActionSystem } from "../systems";

export function joinGame(network: NetworkLayer, actions: ActionSystem, spawnEntity: EntityIndex) {
  const {
    components: { Player },
    network: { connectedAddress },
    world,
  } = network;

  const actionId = `spawn ${Math.random()}` as EntityID;
  actions.add({
    id: actionId,
    components: { Player },
    requirement: ({ Player }) => {
      const address = connectedAddress.get();
      if (!address) {
        console.warn("No address connected");
        actions.cancel(actionId);
        return;
      }

      const playerEntity = world.entityToIndex.get(address as EntityID);

      if (playerEntity != null && hasComponent(Player, playerEntity)) {
        console.warn("Player already spawned, canceling spawn.");
        actions.cancel(actionId);
        return null;
      }

      return true;
    },
    updates: () => [],
    execute: () => {
      console.log("spawning");
      return network.api.joinGame(world.entities[spawnEntity]);
    },
  });
}
