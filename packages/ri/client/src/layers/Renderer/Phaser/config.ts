import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Sprites, Animations, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH, Tilesets, Layers } from "./constants";
import { Tileset as OverworldTileset, TileAnimations as OverworldTileAnimations } from "./tilesets/overworldTileset";
import { Tileset as TreesTileset, TileAnimations as TreesTileAnimations } from "./tilesets/treesTileset";
import overworldTileset from "../assets/tilesets/overworld-tileset.png";
import mountainTileset from "../assets/tilesets/mountain-tileset.png";
import treesTileset from "../assets/tilesets/trees-tileset.png";

const FRAME_RATE = 10;
const SIXTY_FPS_FRAME_RATE = 20;
const ANIMATION_INTERVAL = Math.floor(1000 / FRAME_RATE);
const SIXTY_FPS_ANIMATION_INTERVAL = Math.floor(1000 / SIXTY_FPS_FRAME_RATE);

export const config = {
  sceneConfig: {
    [Scenes.Main]: defineSceneConfig({
      assets: {
        [Assets.OverworldTileset]: { type: AssetType.Image, key: Assets.OverworldTileset, path: overworldTileset },
        [Assets.MountainTileset]: { type: AssetType.Image, key: Assets.MountainTileset, path: mountainTileset },
        [Assets.TreesTileset]: { type: AssetType.Image, key: Assets.TreesTileset, path: treesTileset },
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
          tileAnimations: { ...OverworldTileAnimations, ...TreesTileAnimations },
          layers: {
            layers: {
              [Layers.Background]: { tilesets: [Tilesets.Overworld], hasHueTintShader: true },
              [Layers.Foreground]: { tilesets: [Tilesets.Overworld], hasHueTintShader: true },
              [Layers.Trees]: { tilesets: [Tilesets.Trees], hasHueTintShader: true },
            },
            defaultLayer: Layers.Background,
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
              [Layers.Background]: { tilesets: [Tilesets.Overworld] },
            },
            defaultLayer: Layers.Background,
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
              [Layers.Background]: { tilesets: [Tilesets.Overworld] },
            },
            defaultLayer: Layers.Background,
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
          frame: "sprites/structures/small/settlement.png",
        },
        [Sprites.Gold]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/items/gold.png",
        },
        [Sprites.Inventory]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/items/bag.png",
        },
        [Sprites.GoldShrine]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/structures/small/gold-shrine.png",
        },
        [Sprites.EscapePortal]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/structures/small/portal/0.png",
        },
        [Sprites.EmberCrown]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/items/wood.png",
        },
        [Sprites.Donkey]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/workers/donkey.png",
        },
      },
      animations: [
        {
          key: Animations.EscapePortalAnimation,
          assetKey: Assets.MainAtlas,
          startFrame: 0,
          endFrame: 59,
          frameRate: SIXTY_FPS_FRAME_RATE,
          repeat: -1,
          prefix: "sprites/structures/small/portal/",
          suffix: ".png",
        },
      ],
      tilesets: {
        [Tilesets.Overworld]: { assetKey: Assets.OverworldTileset, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT },
        [Tilesets.Trees]: { assetKey: Assets.TreesTileset, tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT },
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
