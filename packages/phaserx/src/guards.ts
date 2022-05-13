import {
  Assets,
  CameraConfig,
  LayerConfig,
  MapConfig,
  MapsConfig,
  SceneConfig,
  TilesetConfig,
  Animation,
  GameObjectTypes,
  GameObject,
} from "./types";

// Add type safety to config definitions

export function defineAssetsConfig<A extends Assets>(assets: A) {
  return assets;
}

export function defineMapConfig<A extends Assets, T extends TilesetConfig<A>, L extends LayerConfig<A, T>>(
  config: MapConfig<A, T, L>
) {
  return config;
}

export function defineSceneConfig<
  A extends Assets,
  T extends TilesetConfig<A>,
  M extends MapsConfig<A, T>,
  Ans extends Animation<A>[]
>(config: SceneConfig<A, T, M, Ans>) {
  return config;
}

export function defineScaleConfig(config: Phaser.Types.Core.ScaleConfig) {
  return config;
}

export function defineCameraConfig(config: CameraConfig) {
  return config;
}

export function isSprite(
  gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): gameObject is GameObject<"Sprite"> {
  return type === "Sprite";
}

export function isRectangle(
  gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): gameObject is GameObject<"Rectangle"> {
  return type === "Rectangle";
}
