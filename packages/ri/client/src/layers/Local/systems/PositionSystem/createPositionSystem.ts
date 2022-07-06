import { defineComponentSystem, getComponentValue, setComponent } from "@latticexyz/recs";
import { LocalLayer } from "../../types";
import { aStar } from "../../../../utils/pathfinding";
import { worldCoordEq } from "../../../../utils/coords";

/**
 * The Position system handles pathing locally for entities if their network layer Position changed.
 */
export function createPositionSystem(layer: LocalLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position, Movable },
      },
    },
    components: { LocalPosition, Path },
  } = layer;

  defineComponentSystem(world, Position, ({ entity, value }) => {
    const targetPosition = value[0];
    if (targetPosition == null) return;

    const localPosition = getComponentValue(LocalPosition, entity);
    if (!localPosition || worldCoordEq(targetPosition, localPosition)) return;

    const moveSpeed = getComponentValue(Movable, entity);
    if (moveSpeed == null) {
      setComponent(LocalPosition, entity, targetPosition);
      return;
    }

    const path = aStar(localPosition, targetPosition, moveSpeed.value + 1, layer.parentLayers.network, LocalPosition);

    if (path.length > 0) {
      const x: number[] = [];
      const y: number[] = [];
      for (const coord of path) {
        x.push(coord.x);
        y.push(coord.y);
      }

      setComponent(Path, entity, { x, y });
    } else {
      setComponent(LocalPosition, entity, targetPosition);
    }
  });
}
