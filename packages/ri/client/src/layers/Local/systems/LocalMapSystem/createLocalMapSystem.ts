import { createEntity, withValue } from "@latticexyz/recs";
import { LocalLayer } from "../../types";

export function createLocalMapSystem(layer: LocalLayer) {
  const {
    world,
    components: { LocalPosition, RockWall },
  } = layer;
  const size = 100;
  setTimeout(() => {
    for (let x = -size / 2; x < size / 2; x++) {
      for (let y = -size / 2; y < size / 2; y++) {
        createEntity(world, [withValue(LocalPosition, { x, y }), withValue(RockWall, { value: true })], {
          idSuffix: "Wall",
        });
      }
    }
  }, 1000);
  //
}
