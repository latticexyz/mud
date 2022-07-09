import { getComponentValue, EntityIndex, EntityID, setComponent, Type, Component, World } from "@latticexyz/recs";
import { ActionSystem } from "../systems";
import { NetworkLayer } from "../../Network";
import { WorldCoord } from "../../../types";
import { aStar } from "../../../../src/utils/pathfinding";

export function moveEntity(
  context: {
    network: NetworkLayer;
    actions: ActionSystem;
    LocalStamina: Component<{ current: Type.Number }>;
    world: World;
  },
  entity: EntityIndex,
  targetPosition: WorldCoord
) {
  const {
    network: {
      components: { Position, Movable, Untraversable, OwnedBy },
      network: { connectedAddress },
      api: networkApi,
    },
    world,
    LocalStamina,
    actions,
  } = context;

  // Entity must be movable
  const moveSpeed = getComponentValue(Movable, entity)?.value;
  if (!moveSpeed) return;

  // Entity must be owned by the player
  const movingEntityOwner = getComponentValue(OwnedBy, entity)?.value;
  if (movingEntityOwner == null) {
    console.warn("Entity has no owner");
    return;
  }

  if (movingEntityOwner !== connectedAddress.get()) {
    console.warn("Can only move entities you own", movingEntityOwner, connectedAddress.get());
    return;
  }

  const actionID = `move ${Math.random()}` as EntityID;

  actions.add({
    id: actionID,
    components: {
      Position,
      Untraversable,
      LocalStamina,
    },
    requirement: ({ LocalStamina, Position }) => {
      const localStamina = getComponentValue(LocalStamina, entity);
      if (!localStamina) {
        console.warn("no local stamina");
        actions.cancel(actionID);
        return null;
      }
      const netStamina = localStamina.current - 1;
      if (netStamina < 0) {
        console.warn("net stamina below 0");
        actions.cancel(actionID);
        return null;
      }
      const currentPosition = getComponentValue(Position, entity);
      if (!currentPosition) {
        console.warn("no current position");
        actions.cancel(actionID);
        return null;
      }

      const path = aStar(currentPosition, targetPosition, moveSpeed + 1, context.network, Position);
      if (path.length == 0) {
        actions.cancel(actionID);
        return null;
      }
      return {
        targetPosition,
        path,
        netStamina,
      };
    },
    updates: (_, { targetPosition, netStamina }) => [
      {
        component: "Position",
        entity: entity,
        value: targetPosition,
      },
      {
        component: "LocalStamina",
        entity,
        value: { current: netStamina },
      },
    ],
    execute: async ({ path, netStamina }) => {
      const tx = await networkApi.moveEntity(world.entities[entity], path);
      await tx.wait();
      setComponent(LocalStamina, entity, { current: netStamina });
    },
  });
}
