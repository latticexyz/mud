import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Animations, Assets, Maps, Scenes, TileAnimations, Tileset, TILE_HEIGHT, TILE_WIDTH } from "./constants";
import tilemap from "../assets/overworld-tileset.png";
import imp from "../assets/imp.png";
import legendary from "../assets/legendary.png";

export const config = {
  sceneConfig: {
    [Scenes.Main]: defineSceneConfig({
      assets: {
        [Assets.Tilemap]: { type: AssetType.Image, key: Assets.Tilemap, path: tilemap },
        [Assets.Imp]: {
          type: AssetType.SpriteSheet,
          key: Assets.Imp,
          path: imp,
          options: { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT },
        },
        [Assets.Legendary]: {
          type: AssetType.SpriteSheet,
          key: Assets.Legendary,
          path: legendary,
          options: { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT },
        },
        [Assets.MainAtlas]: {
          type: AssetType.MultiAtlas,
          key: Assets.MainAtlas,
          path: "/atlases/atlas.json",
          options: {
            imagePath: "/atlases/",
          },
        },
      },
      maps: {
        [Maps.Main]: defineMapConfig({
          chunkSize: TILE_WIDTH * 64, // tile size * tile amount
          tileWidth: TILE_WIDTH,
          tileHeight: TILE_HEIGHT,
          backgroundTile: [Tileset.Wall1],
          animationInterval: 100,
          tileAnimations: TileAnimations,
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
          backgroundTile: [Tileset.Wall1],
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
          backgroundTile: [Tileset.Wall1],
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
        {
          key: Animations.SettlementIdle,
          frameRate: 10,
          assetKey: Assets.MainAtlas,
          startFrame: 0,
          endFrame: 0,
          repeat: -1,
          prefix: "sprites/base/small-base/",
          suffix: ".png",
        },
      ],
      tilesets: {
        Default: { assetKey: Assets.Tilemap, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT },
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
