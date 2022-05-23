import { LocalLayer } from "../../types";
import {
  Has,
  HasValue,
  createEntity,
  withValue,
  getQueryResult,
  defineReactionSystem,
  getComponentValueStrict,
  removeEntity,
  defineEnterQuery,
} from "@mudkit/recs";
import { WorldCoord } from "../../../../types";
import { getSurroundingCoords } from "../../../../utils/directions";

export function createRockWallSystem(layer: LocalLayer) {
  const {
    world,
    components: { LocalPosition, RockWall },
    parentLayers: {
      network: {
        components: { Position, MinedTag },
      },
    },
  } = layer;

  function setSurroundingWall(coord: WorldCoord) {
    for (const adjacentCoord of getSurroundingCoords(coord, 1)) {
      // Set a RockWall component if the position is not mined
      if (
        getQueryResult([HasValue(Position, adjacentCoord), Has(MinedTag)]).size == 0 &&
        getQueryResult([HasValue(LocalPosition, adjacentCoord), Has(RockWall)]).size == 0
      ) {
        createEntity(world, [withValue(LocalPosition, adjacentCoord), withValue(RockWall, {})]);
      }
    }
  }

  const minedQuery = defineEnterQuery(world, [Has(MinedTag), Has(Position)], { runOnInit: true });
  defineReactionSystem(
    world,
    () => minedQuery.get(),
    (minedEntities) => {
      for (const minedEntity of minedEntities) {
        const coord = getComponentValueStrict(Position, minedEntity);

        // Remove potential wall at this position
        const wallEntities = getQueryResult([HasValue(LocalPosition, coord), Has(RockWall)]);
        if (wallEntities.size > 0) {
          for (const wallEntity of wallEntities) {
            removeEntity(world, wallEntity);
          }
        }

        // Set surrounding walls
        setSurroundingWall(coord);
      }
    }
  );

  //
}
