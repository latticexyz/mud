import { getComponentValue, EntityIndex, EntityID, Type, Component, World } from "@latticexyz/recs";
import { ActionSystem } from "../systems";
import { NetworkLayer } from "../../Network";
import { WorldCoord } from "../../../types";
import { aStar } from "../../../../src/utils/pathfinding";
import { isUntraversable } from "@latticexyz/std-client";

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
      components: { Position, Movable, Untraversable, OwnedBy, Stamina },
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

  const actionID = `move ${Date.now()}` as EntityID; // Date.now to have the actions ordered in the component browser

  actions.add<
    // Need to debug why typescript can't automatically infer these in this case, but for now manually typing removes the error
    {
      Position: typeof Position;
      Untraversable: typeof Untraversable;
      LocalStamina: typeof LocalStamina;
      Stamina: typeof Stamina;
    },
    { targetPosition: WorldCoord; path: WorldCoord[]; netStamina: number }
  >({
    id: actionID,
    components: {
      Position,
      Untraversable,
      LocalStamina,
      Stamina,
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

      const isUntraversableFunc = (targetPosition: WorldCoord) =>
        isUntraversable(Untraversable, Position, targetPosition);
      const path = aStar(currentPosition, targetPosition, moveSpeed, isUntraversableFunc);
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
        component: "Stamina",
        entity,
        value: { current: netStamina },
      },
    ],
    execute: async ({ path }) => {
      return networkApi.moveEntity(world.entities[entity], path);
    },
  });
}
