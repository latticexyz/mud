import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Animations, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH } from "./constants";

import overworldTileset from "../assets/tilesets/overworld-tileset.png";
import mountainTileset from "../assets/tilesets/mountain-tileset.png";

import { Tileset as OverworldTileset } from "./tilesets/overworldTileset";
import { TileAnimations as OverworldTileAnimations } from "./tilesets/overworldTileset";

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
          animationInterval: 100,
          tileAnimations: OverworldTileAnimations,
          layers: {
            layers: {
              Background: { tilesets: ["Default"], hasHueTintShader: true },
            },
            defaultLayer: "Background",
          },
        }),
        [Maps.Tactic]: defineMapConfig({
          chunkSize: TILE_WIDTH * 64, // tile size * tile amount
          tileWidth: TILE_WIDTH * 4,
          tileHeight: TILE_HEIGHT * 4,
          backgroundTile: [OverworldTileset.Brick1],
          animationInterval: 100,
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
          animationInterval: 100,
          layers: {
            layers: {
              Background: { tilesets: ["Default"] },
            },
            defaultLayer: "Background",
          },
        }),
      },
      animations: [
        {
          key: Animations.ImpIdle,
          frameRate: 10,
          assetKey: Assets.MainAtlas,
          startFrame: 0,
          endFrame: 0,
          repeat: -1,
          prefix: "sprites/workers/bridge-builder-imp/",
          suffix: ".png",
        },
        {
          key: Animations.HeroIdle,
          frameRate: 10,
          assetKey: Assets.MainAtlas,
          startFrame: 0,
          endFrame: 0,
          repeat: -1,
          prefix: "sprites/warriors/hero/",
          suffix: ".png",
        },
      ],
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
