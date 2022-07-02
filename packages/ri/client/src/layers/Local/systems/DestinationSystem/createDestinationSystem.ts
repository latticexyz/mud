import { defineComponentSystem, getComponentValue, removeComponent, setComponent } from "@latticexyz/recs";
import { worldCoordEq } from "../../../../utils/coords";
import { aStar } from "../../../../utils/pathfinding";
import { LocalLayer } from "../../types";

/**
 * The Destination system handles computing a path to the coordinate given in the Destination component and sets the Path component.
 */
export function createDestinationSystem(layer: LocalLayer) {
  const {
    world,
    components: { Destination, LocalPosition, Path },
  } = layer;

  defineComponentSystem(world, Destination, (update) => {
    const destination = update.value[0];
    if (!destination) return;

    removeComponent(Destination, update.entity);

    const localPosition = getComponentValue(LocalPosition, update.entity);
    if (!localPosition || worldCoordEq(destination, localPosition)) return;

    const path = aStar(localPosition, destination);
    const x: number[] = [];
    const y: number[] = [];
    for (const coord of path) {
      x.push(coord.x);
      y.push(coord.y);
    }
    setComponent(Path, update.entity, { x, y });
  });
}
