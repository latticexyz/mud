import { defineComponentSystem, getComponentValue, removeComponent, setComponent } from "@latticexyz/recs";
import { worldCoordEq } from "../../../../utils/coords";
import { manhattan } from "../../../../utils/distance";
import { aStar, directionalPathfind } from "../../../../utils/pathfinding";
import { LocalLayer } from "../../types";

/**
 * The Destination system handles computing a path to the coordinate given in the Destination component and sets the Path component.
 */
export function createDestinationSystem(layer: LocalLayer) {
  const {
    world,
    components: { Destination, LocalPosition, Path },
    parentLayers: {
      headless: {
        components: { LocalStamina },
      },
      network: {
        components: { Movable },
      },
    },
  } = layer;

  defineComponentSystem(world, Destination, (update) => {
    const destination = update.value[0];
    if (!destination) return;

    removeComponent(Destination, update.entity);

    const localPosition = getComponentValue(LocalPosition, update.entity);
    if (!localPosition || worldCoordEq(destination, localPosition)) return;

    const localStamina = getComponentValue(LocalStamina, update.entity);
    if (!localStamina) return;

    const netStamina = localStamina.current as number;
    if (!netStamina) {
      return;
    }
    const moveSpeed = getComponentValue(Movable, update.entity);
    if (!moveSpeed) {
      return;
    }

    let path = aStar(
      localPosition,
      destination,
      manhattan(localPosition, destination) + 1,
      layer.parentLayers.network,
      LocalPosition
    );

    if (path.length == 0) {
      // HACK if no path found just do the old method
      path = directionalPathfind(localPosition, destination);
    }

    const x: number[] = [];
    const y: number[] = [];
    for (const coord of path) {
      x.push(coord.x);
      y.push(coord.y);
    }
    setComponent(Path, update.entity, { x, y });
  });
}
