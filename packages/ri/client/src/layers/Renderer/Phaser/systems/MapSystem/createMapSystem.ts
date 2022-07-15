import { Coord } from "@latticexyz/phaserx";
import { addCoords, ZERO_VECTOR } from "@latticexyz/phaserx";
import { Has, getComponentValueStrict, defineEnterSystem, runQuery, HasValue } from "@latticexyz/recs";
import { TerrainTypes } from "../../../../Network";
import { Layers } from "../../constants";
import {
  TileAnimationKey as OverworldTileAnimationKey,
  Tileset as OverworldTileset,
  WangSetKey as OverworldWangSetKey,
  WangSets as OverworldWangSets,
} from "../../tilesets/overworldTileset";
import { TileAnimationKey as TreesTileAnimationKey, Tileset as TreesTileset } from "../../tilesets/treesTileset";
import { PhaserLayer } from "../../types";

const terrainTypeToBackgroundTile = {
  [TerrainTypes.Grass]: OverworldTileset.Grass,
  // [TerrainTypes.Mountain]: OverworldTileset.PlainRock1,
  // [TerrainTypes.Water]: OverworldTileset.Water,
  // [TerrainTypes.Tree]: OverworldTileset.Grass,
} as { [key in TerrainTypes]: OverworldTileset };

const terrainTypeToBackgroundWangSet = {} as { [key in TerrainTypes]: OverworldWangSetKey };

const terrainTypeToBackgroundAnimation = {
  [TerrainTypes.Water]: OverworldTileAnimationKey.Water,
} as { [key in TerrainTypes]: OverworldTileAnimationKey };

const terrainTypeToForegroundTile = {} as { [key in TerrainTypes]: OverworldTileset };

const terrainTypeToForegroundWangSet = {
  [TerrainTypes.Water]: OverworldWangSetKey.Water,
} as { [key in TerrainTypes]: OverworldWangSetKey };

const terrainTypeToForegroundAnimation = {} as { [key in TerrainTypes]: OverworldTileAnimationKey };

const terrainTypeToTreesTile = {} as { [key in TerrainTypes]: TreesTileset };

const terrainTypeToTreesWangset = {} as { [key in TerrainTypes]: never };

const terrainTypeToTreesAnimation = {
  [TerrainTypes.Tree]: TreesTileAnimationKey.Azalea,
} as { [key in TerrainTypes]: TreesTileAnimationKey };

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

  function drawWangSetAtCoord(coord: Coord, entityType: TerrainTypes, mapping: any, wangSets: any, layer: Layers) {
    const wangSetKey = mapping[entityType as TerrainTypes];
    if (!wangSetKey) return;
    const wangSet = wangSets[wangSetKey];
    if (!wangSet) {
      throw new Error("no wang set!");
    }
    // redraw itself then all neighbors
    for (const offset of [ZERO_VECTOR, ...WANG_OFFSET]) {
      // is this tile an entity of type entityType?
      const coordToRedraw = addCoords(coord, offset);
      const entities = runQuery([HasValue(Position, coordToRedraw), HasValue(TerrainType, { value: entityType })]);
      if (entities.size === 0) continue;
      const wangId = calculateWangId(coordToRedraw, entityType);
      if (wangSet[wangId] == null) continue;
      Main.putTileAt(coordToRedraw, wangSet[wangId], layer);
    }
  }

  defineEnterSystem(
    world,
    [Has(Position), Has(TerrainType)],
    (update) => {
      const coord = getComponentValueStrict(Position, update.entity);
      const type = getComponentValueStrict(TerrainType, update.entity);
      const backgroundTile = terrainTypeToBackgroundTile[type.value as TerrainTypes];
      const foregroundTile = terrainTypeToForegroundTile[type.value as TerrainTypes];
      const treesTile = terrainTypeToTreesTile[type.value as TerrainTypes];

      const backgroundAnimation = terrainTypeToBackgroundAnimation[type.value as TerrainTypes];
      // const foregroundAnimation = terrainTypeToForegroundAnimation[type.value as TerrainTypes];
      const treesAnimation = terrainTypeToTreesAnimation[type.value as TerrainTypes];

      if (backgroundAnimation) Main.putAnimationAt(coord, backgroundAnimation, Layers.Background);
      // if (foregroundAnimation) Main.putAnimationAt(coord, foregroundAnimation, Layers.Foreground);
      // if (treesAnimaton) Main.putAnimationAt(coord, treesAnimaton, Layers.Trees);

      if (backgroundTile) Main.putTileAt(coord, backgroundTile, Layers.Background);
      // if (foregroundTile) Main.putTileAt(coord, foregroundTile, Layers.Foreground);
      // if (treesTile) Main.putTileAt(coord, treesTile, Layers.Trees);

      // drawWangSetAtCoord(coord, type.value, terrainTypeToBackgroundWangSet, OverworldWangSets, Layers.Background);
      // drawWangSetAtCoord(coord, type.value, terrainTypeToForegroundWangSet, OverworldWangSets, Layers.Foreground);
      // drawWangSetAtCoord(coord, type.value, terrainTypeToTreesWangset, TreesWangSets, Layers.Trees);

      // // compute cluster for LOD
      // if (coord.x % 4 === 0 && coord.y % 4 === 0) {
      //   const tacticCoord = { x: Math.floor(coord.x / 4), y: Math.floor(coord.y / 4) };
      //   Tactic.putTileAt(tacticCoord, tile);
      // }

      // if (coord.x % 16 === 0 && coord.y % 16 === 0) {
      //   const strategicCoord = { x: Math.floor(coord.x / 16), y: Math.floor(coord.y / 16) };
      //   Strategic.putTileAt(strategicCoord, tile);
      // }
    },
    { runOnInit: true }
  );
}
