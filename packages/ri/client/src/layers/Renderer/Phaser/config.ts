import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Animations, Sprites, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH } from "./constants";

import overworldTileset from "../assets/tilesets/overworld-tileset.png";
import mountainTileset from "../assets/tilesets/mountain-tileset.png";

import { Tileset as OverworldTileset } from "./tilesets/overworldTileset";
import { TileAnimations as OverworldTileAnimations } from "./tilesets/overworldTileset";

const ANIMATION_INTERVAL = 200;

export const config = {
  sceneConfig: {
    [Scenes.Main]: defineSceneConfig({
      assets: {
        [Assets.OverworldTileset]: { type: AssetType.Image, key: Assets.OverworldTileset, path: overworldTileset },
        [Assets.MountainTileset]: { type: AssetType.Image, key: Assets.MountainTileset, path: mountainTileset },
        [Assets.MainAtlas]: {
          type: AssetType.MultiAtlas,
          key: Assets.MainAtlas,
          path: "/atlases/sprites/atlas.json",
          options: {
            imagePath: "/atlases/sprites/",
          },
        },
      },
      maps: {
        [Maps.Main]: defineMapConfig({
          chunkSize: TILE_WIDTH * 64, // tile size * tile amount
          tileWidth: TILE_WIDTH,
          tileHeight: TILE_HEIGHT,
          backgroundTile: [OverworldTileset.Brick1],
          animationInterval: ANIMATION_INTERVAL,
          tileAnimations: OverworldTileAnimations,
          layers: {
            layers: {
              Background: { tilesets: ["Default"], hasHueTintShader: true },
              Foreground: { tilesets: ["Default"], hasHueTintShader: true },
            },
            defaultLayer: "Background",
          },
        }),
        [Maps.Tactic]: defineMapConfig({
          chunkSize: TILE_WIDTH * 64, // tile size * tile amount
          tileWidth: TILE_WIDTH * 4,
          tileHeight: TILE_HEIGHT * 4,
          backgroundTile: [OverworldTileset.Brick1],
          animationInterval: ANIMATION_INTERVAL,
          tileAnimations: OverworldTileAnimations,
          layers: {
            layers: {
              Background: { tilesets: ["Default"] },
            },
            defaultLayer: "Background",
          },
        }),
        [Maps.Strategic]: defineMapConfig({
          chunkSize: TILE_WIDTH * 64 * 8, // tile size * tile amount
          tileWidth: TILE_WIDTH * 16,
          tileHeight: TILE_HEIGHT * 16,
          backgroundTile: [OverworldTileset.Brick1],
          animationInterval: ANIMATION_INTERVAL,
          tileAnimations: OverworldTileAnimations,
          layers: {
            layers: {
              Background: { tilesets: ["Default"] },
            },
            defaultLayer: "Background",
          },
        }),
      },
      sprites: {
        [Sprites.Imp]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/workers/bridge-builder-imp.png",
        },
      },
      animations: [],
      tilesets: {
        Default: { assetKey: Assets.OverworldTileset, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT },
      },
    }),
  },
  scale: defineScaleConfig({
    parent: "phaser-game",
    zoom: 2,
    mode: Phaser.Scale.NONE,
  }),
  cameraConfig: defineCameraConfig({
    phaserSelector: "phaser-game",
    pinchSpeed: 1,
    wheelSpeed: 1,
    maxZoom: 2,
    minZoom: 1 / 32,
  }),
  cullingChunkSize: TILE_HEIGHT * 16,
};
