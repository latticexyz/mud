import { Coord } from "@latticexyz/phaserx";
import { addCoords, ZERO_VECTOR } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineEnterSystem, runQuery, HasValue } from "@latticexyz/recs";
import { TerrainTypes } from "../../../../Network/types";
import { TileAnimationKey, Tileset, WangSetKey, WangSets } from "../../tilesets/overworldTileset";
import { PhaserLayer } from "../../types";

const terrainTypeToTile = {
  [TerrainTypes.Grass]: Tileset.Grass,
  [TerrainTypes.Mountain]: Tileset.PlainRock1,
  [TerrainTypes.Water]: Tileset.Water,
  [TerrainTypes.Tree]: Tileset.Grass,
} as { [key in TerrainTypes]: Tileset };

const terrainTypesToForegroundTile = {
  [TerrainTypes.Tree]: Tileset.Tree1,
} as { [key in TerrainTypes]: Tileset };

const entityTypeToAnimation = {
  [TerrainTypes.Water]: TileAnimationKey.Water,
} as { [key in TerrainTypes]: TileAnimationKey };

const terrainTypeToWangSet = {
  [TerrainTypes.Water]: WangSetKey.Water,
} as { [key in TerrainTypes]: WangSetKey };

/**
 * The Map system handles rendering the phaser tilemap
 */
export function createMapSystem(layer: PhaserLayer) {
  const {
    world,
    parentLayers: {
      network: {
        components: { Position, TerrainType },
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
  // defineEnterSystem(world, [Has(Position), Not(TerrainType)], (update) => {
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

  function calculateWangId(coord: Coord, entityType: TerrainTypes) {
    const bits = [];
    for (const offset of WANG_OFFSET) {
      const checkCoord = addCoords(coord, offset);
      const entities = runQuery([HasValue(Position, checkCoord), HasValue(TerrainType, { value: entityType })]);
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

  function drawWangSetAtCoord(coord: Coord, entityType: TerrainTypes) {
    const wangSetKey = terrainTypeToWangSet[entityType as TerrainTypes];
    if (!wangSetKey) return;
    const wangSet = WangSets[wangSetKey];
    // redraw itself then all neighbors
    for (const offset of [ZERO_VECTOR, ...WANG_OFFSET]) {
      // is this tile an entity of type entityType?
      const coordToRedraw = addCoords(coord, offset);
      const entities = runQuery([HasValue(Position, coordToRedraw), HasValue(TerrainType, { value: entityType })]);
      if (entities.size === 0) continue;
      const wangId = calculateWangId(coordToRedraw, entityType);
      if (wangSet[wangId] == null) continue;
      Main.putTileAt(coordToRedraw, wangSet[wangId], "Foreground");
    }
  }

  defineEnterSystem(
    world,
    [Has(Position), Has(TerrainType)],
    (update) => {
      const coord = getComponentValueStrict(Position, update.entity);
      const type = getComponentValueStrict(TerrainType, update.entity);
      const tile = terrainTypeToTile[type.value as TerrainTypes];
      const foregroundTile = terrainTypesToForegroundTile[type.value as TerrainTypes];
      const animation = entityTypeToAnimation[type.value as TerrainTypes];
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
