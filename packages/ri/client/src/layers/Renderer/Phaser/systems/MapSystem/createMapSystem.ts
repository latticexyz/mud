import { Has, getComponentValueStrict, defineEnterSystem, Not } from "@latticexyz/recs";
import { EntityTypes } from "../../../../Network";
import { TileAnimationKey, Tileset } from "../../tilesets/overworldTileset";
import { PhaserLayer } from "../../types";

const entityTypeToTile = {
  [EntityTypes.Grass]: Tileset.Grass,
  [EntityTypes.Mountain]: Tileset.PlainRock1,
  [EntityTypes.River]: Tileset.Water,
} as { [key in EntityTypes]: Tileset };

const entityTypeToAnimation = {
  [EntityTypes.River]: TileAnimationKey.Water,
} as { [key in EntityTypes]: TileAnimationKey };

/**
 * The Map system handles rendering the phaser tilemap
 */
export function createMapSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position, EntityType },
      },
    },
    scenes: {
      Main: {
        maps: { Main, Tactic, Strategic },
        camera,
        objectPool,
      },
    },
  } = layer;

  const zoomSub = camera.zoom$.subscribe((zoom) => {
    if (zoom < 0.1) {
      Strategic.setVisible(true);
      Tactic.setVisible(false);
      Main.setVisible(false);
      camera.ignore(objectPool, true);
    } else if (zoom < 0.5) {
      Strategic.setVisible(false);
      Tactic.setVisible(true);
      Main.setVisible(false);
      camera.ignore(objectPool, true);
    } else {
      Strategic.setVisible(false);
      Tactic.setVisible(false);
      Main.setVisible(true);
      camera.ignore(objectPool, false);
    }
  });
  world.registerDisposer(() => zoomSub?.unsubscribe());

  defineEnterSystem(world, [Has(Position), Not(EntityType)], (update) => {
    const coord = getComponentValueStrict(Position, update.entity);
    // TODO: commented till we fix the uploader to bundle untraversable and entity type together
    // Main.putTileAt(coord, Tileset.Plain);
  });

  defineEnterSystem(
    world,
    [Has(Position), Has(EntityType)],
    (update) => {
      const coord = getComponentValueStrict(Position, update.entity);
      const type = getComponentValueStrict(EntityType, update.entity);
      const tile = entityTypeToTile[type.value as EntityTypes];
      const animation = entityTypeToAnimation[type.value as EntityTypes];
      if (!tile) return;
      if (animation) Main.putAnimationAt(coord, animation);

      Main.putTileAt(coord, tile);

      // compute cluster for LOD
      if (coord.x % 4 === 0 && coord.y % 4 === 0) {
        const tacticCoord = { x: Math.floor(coord.x / 4), y: Math.floor(coord.y / 4) };
        Tactic.putTileAt(tacticCoord, tile);
      }

      if (coord.x % 16 === 0 && coord.y % 16 === 0) {
        const strategicCoord = { x: Math.floor(coord.x / 16), y: Math.floor(coord.y / 16) };
        Strategic.putTileAt(strategicCoord, tile);
      }
    },
    { runOnInit: true }
  );
}
