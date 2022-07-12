import { Coord } from "@latticexyz/phaserx";
import { addCoords, ZERO_VECTOR } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineEnterSystem, runQuery, HasValue } from "@latticexyz/recs";
import { EntityTypes } from "../../../../Network";
import { TileAnimationKey, Tileset, WangSetKey, WangSets } from "../../tilesets/overworldTileset";
import { PhaserLayer } from "../../types";

const entityTypeToTile = {
  [EntityTypes.Grass]: Tileset.Grass,
  [EntityTypes.Mountain]: Tileset.PlainRock1,
  [EntityTypes.River]: Tileset.Water,
  [EntityTypes.Tree]: Tileset.Grass,
} as { [key in EntityTypes]: Tileset };

const entityTypeToForegroundTile = {
  [EntityTypes.Tree]: Tileset.Tree1,
} as { [key in EntityTypes]: Tileset };

const entityTypeToAnimation = {
  [EntityTypes.River]: TileAnimationKey.Water,
} as { [key in EntityTypes]: TileAnimationKey };

const entityTypeToWangSet = {
  [EntityTypes.River]: WangSetKey.Water,
} as { [key in EntityTypes]: WangSetKey };

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

  // TODO: commented till we fix the uploader to bundle untraversable and entity type together
  // defineEnterSystem(world, [Has(Position), Not(EntityType)], (update) => {
  // const coord = getComponentValueStrict(Position, update.entity);
  // Main.putTileAt(coord, Tileset.Plain);
  // });
  //
  const WANG_OFFSET = [
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
  ];

  function calculateWangId(coord: Coord, entityType: EntityTypes) {
    const bits = [];
    for (const offset of WANG_OFFSET) {
      const checkCoord = addCoords(coord, offset);
      const entities = runQuery([HasValue(Position, checkCoord), HasValue(EntityType, { value: entityType })]);
      if (entities.size > 0) {
        bits.push(1);
      } else {
        bits.push(0);
      }
    }

    // turn the bitstring into a decimal number (with MSB on the right!)
    // ignore "corner" bits if their neighbors are not set
    // corner bits are bits [1,3,5,7]
    // 7 | 0 | 1
    // 6 | x | 2
    // 5 | 4 | 3
    return bits.reduce((acc, b, i, arr) => {
      if (i % 2 === 0) {
        return acc + Math.pow(2, i) * b;
      } else {
        const before = (i - 1) % 8;
        const after = (i + 1) % 8;
        if (arr[before] && arr[after]) {
          return acc + Math.pow(2, i) * b;
        } else {
          return acc;
        }
      }
    });
  }

  function drawWangSetAtCoord(coord: Coord, entityType: EntityTypes) {
    const wangSetKey = entityTypeToWangSet[entityType as EntityTypes];
    if (!wangSetKey) return;
    const wangSet = WangSets[wangSetKey];
    // redraw itself then all neighbors
    for (const offset of [ZERO_VECTOR, ...WANG_OFFSET]) {
      // is this tile an entity of type entityType?
      const coordToRedraw = addCoords(coord, offset);
      const entities = runQuery([HasValue(Position, coordToRedraw), HasValue(EntityType, { value: entityType })]);
      if (entities.size === 0) continue;
      const wangId = calculateWangId(coordToRedraw, entityType);
      if (wangSet[wangId] == null) continue;
      Main.putTileAt(coordToRedraw, wangSet[wangId], "Foreground");
    }
  }

  defineEnterSystem(
    world,
    [Has(Position), Has(EntityType)],
    (update) => {
      const coord = getComponentValueStrict(Position, update.entity);
      const type = getComponentValueStrict(EntityType, update.entity);
      const tile = entityTypeToTile[type.value as EntityTypes];
      const foregroundTile = entityTypeToForegroundTile[type.value as EntityTypes];
      const animation = entityTypeToAnimation[type.value as EntityTypes];
      if (!tile) return;
      if (animation) Main.putAnimationAt(coord, animation);
      Main.putTileAt(coord, tile);
      if (foregroundTile) Main.putTileAt(coord, foregroundTile, "Foreground");
      drawWangSetAtCoord(coord, type.value);

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
