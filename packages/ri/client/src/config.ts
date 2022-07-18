import { NetworkConfig, SyncWorkerConfig } from "@latticexyz/network";
import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Sprites, Assets, Maps, Scenes, TILE_HEIGHT, TILE_WIDTH } from "./constants";
import {
  Tileset as OverworldTileset,
  TileAnimations as OverworldTileAnimations,
} from "./assets/tilesets/overworldTileset";
import overworldTileset from "./assets/tilesets/overworld-tileset.png";
import mountainTileset from "./assets/tilesets/mountain-tileset.png";

export type GameConfig = {
  worldAddress: string;
  privateKey: string;
  chainId: number;
  jsonRpc: string;
  wsRpc?: string;
  checkpointUrl?: string;
  devMode: boolean;
  initialBlockNumber: number;
};

export type SetupContractConfig = NetworkConfig & Omit<SyncWorkerConfig, "worldContract" | "mappings">;

export const getNetworkConfig: (networkConfig: GameConfig) => SetupContractConfig = (config) => ({
  clock: {
    period: 1000,
    initialTime: 0,
    syncInterval: 5000,
  },
  provider: {
    jsonRpcUrl: config.jsonRpc,
    wsRpcUrl: config.wsRpc,
    options: {
      batch: false,
    },
  },
  privateKey: config.privateKey,
  chainId: config.chainId,
  checkpointServiceUrl: config.checkpointUrl,
  initialBlockNumber: config.initialBlockNumber,
});

const ANIMATION_INTERVAL = 200;

export const phaserConfig = {
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
          frame: "sprites/resources/gold.png",
        },
        [Sprites.EscapePortal]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/wood.png",
        },
        [Sprites.EmberCrown]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/resources/wood.png",
        },
        [Sprites.Donkey]: {
          assetKey: Assets.MainAtlas,
          frame: "sprites/workers/donkey.png",
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
    minZoom: 1 / 2,
  }),
  cullingChunkSize: TILE_HEIGHT * 16,
};
