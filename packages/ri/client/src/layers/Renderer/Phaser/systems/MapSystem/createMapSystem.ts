import { defineAutorunSystem, defineEnterQuery, Has, defineReactionSystem, getComponentValueStrict } from "@mud/recs";
import { TileAnimationKey, Tileset, RockWallTileset } from "../../constants";
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
        components: { MinedTag, Position },
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

  // Mined tile system
  const minedTilesQuery = defineEnterQuery(world, [Has(MinedTag), Has(Position)], { runOnInit: true });
  defineReactionSystem(
    world,
    () => minedTilesQuery.get(),
    (minedTiles) => {
      for (const minedTile of minedTiles) {
        const coord = getComponentValueStrict(Position, minedTile);
        Main.putTileAt(coord, Tileset.OwnedGround, undefined, 0xff0000);
      }
    }
  );

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

  // TODO: Remove this - only for demonstration purposes
  return defineAutorunSystem(world, () => {
    // Put a gold generator
    Main.putAnimationAt({ x: 0, y: 0 }, TileAnimationKey.GoldGenerator);
    Main.pauseAnimationAt({ x: 0, y: 0 });
    Main.resumeAnimationAt({ x: 0, y: 0 });

    Strategic.putTileAt({ x: 0, y: 0 }, Tileset.OwnedGround);
  });
}
