import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";
import { Animations, Assets, Maps, Scenes, TileAnimations, Tileset } from "./constants";
import tilemap from "../assets/tilemap.png";
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
          options: { frameWidth: 24, frameHeight: 24 },
        },
        [Assets.Legendary]: {
          type: AssetType.SpriteSheet,
          key: Assets.Legendary,
          path: legendary,
          options: { frameWidth: 24, frameHeight: 24 },
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
          tileWidth: 24,
          tileHeight: 24,
          backgroundTile: [Tileset.RockA, Tileset.RockA, Tileset.RockB, Tileset.RockC],
          animationInterval: 100,
          tileAnimations: TileAnimations,
          layers: {
            layers: {
              Background: { tilesets: ["Default"], hasHueTintShader: true },
            },
            defaultLayer: "Background",
          },
        }),
        [Maps.Strategic]: defineMapConfig({
          tileWidth: 24 * 8,
          tileHeight: 24 * 8,
          backgroundTile: [Tileset.RockC],
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
        { key: Animations.ImpIdle, frameRate: 10, assetKey: Assets.Imp, startFrame: 0, endFrame: 3, repeat: -1 },
        {
          key: Animations.ImpDigging,
          frameRate: 10,
          assetKey: Assets.MainAtlas,
          startFrame: 0,
          endFrame: 4,
          repeat: -1,
          prefix: "sprites/creatures/imp/mine/",
          suffix: ".png",
        },
      ],
      tilesets: {
        Default: { assetKey: Assets.Tilemap, tileWidth: 24, tileHeight: 24 },
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
    minZoom: 1 / 4,
  }),
  chunkSize: 576,
};
