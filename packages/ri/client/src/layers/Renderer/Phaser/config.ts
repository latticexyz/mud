import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Sprites, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH } from "./constants";
import { Tileset as OverworldTileset, TileAnimations as OverworldTileAnimations } from "./tilesets/overworldTileset";
import overworldTileset from "../assets/tilesets/overworld-tileset.png";
import mountainTileset from "../assets/tilesets/mountain-tileset.png";

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
        [Sprites.Hero]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/warriors/hero.png",
        },
        [Sprites.Settlement]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/crystal.png",
        },
        [Sprites.Gold]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/gold.png",
        },
        [Sprites.Inventory]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/chest.png",
        },
        [Sprites.GoldShrine]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/sulfur.png",
        },
        [Sprites.EmberCrown]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/donkey.png",
        },
        [Sprites.EscapePortal]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/oil.png",
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
