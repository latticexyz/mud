import {
  Has,
  getComponentValueStrict,
  defineSystem,
  UpdateType,
  ComponentValue,
  Type,
  defineEnterSystem,
  defineEnterQuery,
} from "@latticexyz/recs";
import { EntityTypes } from "../../../../Network/types";
import { Tileset } from "../../constants";
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
      network: {
        components: { Position, EntityType },
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
    if (zoom < 0.000005) {
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

  defineEnterSystem(world, [Has(Position), Has(EntityType)], (update) => {
    const coord = getComponentValueStrict(Position, update.entity);
    const type = getComponentValueStrict(EntityType, update.entity);
    if (type.value === EntityTypes.Grass) Main.putTileAt(coord, Tileset.Grass);
    else if (type.value === EntityTypes.Mountain) Main.putTileAt(coord, Tileset.Rock1);
    else if (type.value === EntityTypes.River) Main.putTileAt(coord, Tileset.Water);
  });
}
