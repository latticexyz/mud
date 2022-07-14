import {
  defineComponentSystem,
  getComponentValue,
  hasComponent,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { aStar } from "../../../../utils/pathfinding";
import { worldCoordEq } from "../../../../utils/coords";
import { isUntraversable } from "@latticexyz/std-client";
import { WorldCoord } from "@latticexyz/phaserx/src/types";

/**
 * The Position system handles pathing locally for entities if their network layer Position changed.
 */
export function createPositionSystem(layer: LocalLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position, Movable, Untraversable },
      },
      headless: {
        actions: { withOptimisticUpdates },
      },
    },
    components: { LocalPosition, Path },
  } = layer;

  defineComponentSystem(world, Position, (update) => {
    const { entity, value } = update;
    const [currentValue] = value;
    if (!hasComponent(LocalPosition, entity) && currentValue) setComponent(LocalPosition, entity, currentValue);
  });

  defineComponentSystem(world, withOptimisticUpdates(Position), (update) => {
    const { entity, value } = update;
    // Remove any outstanding Paths before computing the new location
    removeComponent(Path, entity);

    const targetPosition = value[0];
    if (targetPosition == null) {
      removeComponent(LocalPosition, entity);
      return;
    }

    const moveSpeed = getComponentValue(Movable, entity);
    // If something is not Movable, just directly set the LocalPosition
    if (moveSpeed == null) {
      setComponent(LocalPosition, entity, targetPosition);
      return;
    }

    const localPosition = getComponentValue(LocalPosition, entity);
    if (!localPosition || worldCoordEq(targetPosition, localPosition)) return;

    const isUntraversableFunc = (targetPosition: WorldCoord) =>
      isUntraversable(Untraversable, LocalPosition, targetPosition);
    const path = aStar(localPosition, targetPosition, moveSpeed.value, isUntraversableFunc);

    if (path.length > 0) {
      const x: number[] = [];
      const y: number[] = [];
      for (const coord of path) {
        x.push(coord.x);
        y.push(coord.y);
      }

      setComponent(Path, entity, { x, y });
    } else {
      // If no Path to the target is found, we assume that the
      // Position change occurred outside of normal movement
      // and just set LocalPosition manually.
      setComponent(LocalPosition, entity, targetPosition);
    }
  });
}
