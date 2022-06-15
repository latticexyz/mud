import { defineEnterQuery, Has, defineReactionSystem, getComponentValueStrict } from "@latticexyz/recs";
import { RockWallTileset } from "../../constants";
import { PhaserLayer } from "../../types";

/**
 * The Map system handles rendering the phaser tilemap
 */
export function createMapSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      local: {
        components: { LocalPosition, RockWall },
      },
    },
    scenes: {
      Main: {
        maps: { Main, Strategic },
        camera,
        objectPool,
      },
    },
  } = layer;

  const zoomSub = camera.zoom$.subscribe((zoom) => {
    if (zoom < 0.5) {
      Strategic.setVisible(true);
      Main.setVisible(false);
      camera.ignore(objectPool, true);
    } else {
      Main.setVisible(true);
      Strategic.setVisible(false);
      camera.ignore(objectPool, false);
    }
  });
  world.registerDisposer(() => zoomSub?.unsubscribe());

  // Rock wall system
  const rockWallQuery = defineEnterQuery(world, [Has(LocalPosition), Has(RockWall)], { runOnInit: true });
  defineReactionSystem(
    world,
    () => rockWallQuery.get(),
    (rockWallEnities) => {
      for (const rockWall of rockWallEnities) {
        const coord = getComponentValueStrict(LocalPosition, rockWall);
        Main.putTileAt(coord, RockWallTileset.single);
      }
    }
  );
}
