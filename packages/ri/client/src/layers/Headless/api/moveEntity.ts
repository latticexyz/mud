import {
  hasComponent,
  HasValue,
  runQuery,
  getComponentValue,
  EntityIndex,
  EntityID,
  setComponent,
  Type,
  Component,
  World,
} from "@latticexyz/recs";
import { ActionSystem } from "../systems";
import { Direction, Directions } from "../../../constants";
import { NetworkLayer } from "../../Network";

export function moveEntity(
  context: {
    network: NetworkLayer;
    actions: ActionSystem;
    LocalStamina: Component<{ current: Type.Number }>;
    world: World;
  },
  entity: EntityIndex,
  direction: Direction
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
  const entityCanMove = getComponentValue(Movable, entity)?.value;
  if (!entityCanMove) return;

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
  const delta = Directions[direction];

  actions.add({
    id: actionID,
    components: {
      Position,
      Untraversable,
      LocalStamina,
    },
    requirement: () => {
      const localStamina = getComponentValue(LocalStamina, entity);
      if (!localStamina) {
        actions.cancel(actionID);
        console.warn("no local stamina");
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
      const targetPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };
      // Target position must be traversable
      const entities = runQuery([HasValue(Position, targetPosition)]);
      for (const entity of entities) {
        if (hasComponent(Untraversable, entity)) {
          actions.cancel(actionID);
          console.warn("target is untraversable");
          return null;
        }
      }
      return {
        targetPosition,
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
    execute: async ({ targetPosition, netStamina }) => {
      const tx = await networkApi.moveEntity(world.entities[entity], targetPosition);
      await tx.wait();
      setComponent(LocalStamina, entity, { current: netStamina });
    },
  });
}
