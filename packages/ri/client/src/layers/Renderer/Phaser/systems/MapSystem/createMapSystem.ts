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
        maps: { Main, Pixel, Tactic, Strategic },
        camera,
        objectPool,
      },
    },
  } = layer;

  const zoomSub = camera.zoom$.subscribe((zoom) => {
    // if (zoom < 0.1) {
    //   Strategic.setVisible(true);
    //   Tactic.setVisible(false);
    //   Pixel.setVisible(false);
    //   Main.setVisible(false);
    //   camera.ignore(objectPool, true);
    // } else if (zoom < 0.5) {
    //   Strategic.setVisible(false);
    //   Tactic.setVisible(true);
    //   Pixel.setVisible(true);
    //   Main.setVisible(false);
    //   camera.ignore(objectPool, true);
    // } else {
    Strategic.setVisible(false);
    Tactic.setVisible(false);
    Pixel.setVisible(false);
    Main.setVisible(true);
    camera.ignore(objectPool, false);
    // }
  });
  world.registerDisposer(() => zoomSub?.unsubscribe());

  defineEnterSystem(world, [Has(Position), Has(EntityType)], (update) => {
    const coord = getComponentValueStrict(Position, update.entity);
    const type = getComponentValueStrict(EntityType, update.entity);
    if (type.value === EntityTypes.Grass) {
      console.log("Putting grass at", coord);
      Main.putTileAt(coord, Tileset.Grass);
    } else if (type.value === EntityTypes.Mountain) Main.putTileAt(coord, Tileset.Rock1);
    else if (type.value === EntityTypes.River) Main.putTileAt(coord, Tileset.Water);
    // // compute cluster for LOD
    // if (coord.x % 16 === 0 && coord.y % 16 === 0) {
    //   const tacticCoord = { x: Math.floor(coord.x / 16), y: Math.floor(coord.y / 16) };
    //   if (type.value === EntityTypes.Grass) Tactic.putTileAt(tacticCoord, Tileset.Grass);
    //   else if (type.value === EntityTypes.Mountain) Tactic.putTileAt(tacticCoord, Tileset.Rock1);
    //   else if (type.value === EntityTypes.River) Tactic.putTileAt(tacticCoord, Tileset.Water);
    // }
    // if (coord.x % (16 * 16) === 0 && coord.y % (16 * 16) === 0) {
    //   const strategicCoord = { x: Math.floor(coord.x / (16 * 16)), y: Math.floor(coord.y / (16 * 16)) };
    //   if (type.value === EntityTypes.Grass) Strategic.putTileAt(strategicCoord, Tileset.Grass);
    //   else if (type.value === EntityTypes.Mountain) Strategic.putTileAt(strategicCoord, Tileset.Rock1);
    //   else if (type.value === EntityTypes.River) Strategic.putTileAt(strategicCoord, Tileset.Water);
    // }
  });
}
