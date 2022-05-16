import {
  defineReactionSystem,
  defineUpdateQuery,
  getComponentValue,
  Has,
  removeComponent,
  setComponent,
} from "@mud/recs";
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

  const query = defineUpdateQuery(world, [Has(Destination)], { runOnInit: true });

  defineReactionSystem(
    world,
    () => query.get(),
    (updatedEntities) => {
      for (const entity of updatedEntities) {
        const localPosition = getComponentValue(LocalPosition, entity);
        const destination = getComponentValue(Destination, entity);

        if (!worldCoordEq(localPosition, destination)) {
          removeComponent(Destination, entity);
        }

        if (!localPosition || !destination) {
          return;
        }

        const path = aStar(localPosition, destination);
        const x: number[] = [];
        const y: number[] = [];
        for (const coord of path) {
          x.push(coord.x);
          y.push(coord.y);
        }
        setComponent(Path, entity, { x, y });
      }
      //
    }
  );
}
