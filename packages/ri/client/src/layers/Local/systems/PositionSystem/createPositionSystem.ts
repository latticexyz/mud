import {
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  getComponentValueStrict,
  Has,
  hasComponent,
  Not,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { aStar } from "../../../../utils/pathfinding";
import { worldCoordEq } from "../../../../utils/coords";
import { isUntraversable } from "@latticexyz/std-client";
import { WorldCoord } from "../../../../types";

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

  defineEnterSystem(world, [Has(Position)], ({ entity, value }) => {
    const [currentValue] = value;
    if (!hasComponent(LocalPosition, entity) && currentValue) {
      setComponent(LocalPosition, entity, currentValue);
    }
  });

  defineExitSystem(world, [Has(Position)], ({ entity }) => {
    removeComponent(LocalPosition, entity);
  });

  const OptimisticPosition = withOptimisticUpdates(Position);

  defineUpdateSystem(world, [Has(OptimisticPosition), Not(Movable)], ({ entity, component, value }) => {
    if (component !== OptimisticPosition) return;
    const [targetPosition] = value;
    if (!targetPosition) return;

    setComponent(LocalPosition, entity, targetPosition);
  });

  defineUpdateSystem(world, [Has(OptimisticPosition), Has(Movable), Has(LocalPosition)], (update) => {
    const { entity, component } = update;
    if (component !== OptimisticPosition) return;

    // Remove any outstanding Paths before computing the new location
    removeComponent(Path, entity);

    const moveSpeed = getComponentValueStrict(Movable, entity);
    const targetPosition = getComponentValueStrict(OptimisticPosition, entity);
    const localPosition = getComponentValueStrict(LocalPosition, entity);
    if (worldCoordEq(targetPosition, localPosition)) return;

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
