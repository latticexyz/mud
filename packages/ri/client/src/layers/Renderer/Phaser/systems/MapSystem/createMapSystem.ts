import { Has, getComponentValueStrict, defineSystem, UpdateType, ComponentValue, Type } from "@latticexyz/recs";
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
    if (zoom < 0.005) {
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
  defineSystem(world, [Has(LocalPosition), Has(RockWall)], (update) => {
    if (update.type === UpdateType.Enter || update.type === UpdateType.Update) {
      const coord = getComponentValueStrict(LocalPosition, update.entity);
      Main.putTileAt(coord, RockWallTileset.single);
    } else {
      const prevCoord =
        update.component.id === LocalPosition.id
          ? (update.value[1] as ComponentValue<{ x: Type.Number; y: Type.Number }>)
          : undefined;
      if (prevCoord) Main.putTileAt(prevCoord, -1);
    }
    //
  });
}
