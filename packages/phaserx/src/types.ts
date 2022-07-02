import { defineScene } from "./defineScene";
import { UserHandlers, EventTypes } from "@use-gesture/vanilla";
import { Observable } from "rxjs";
import { createChunks } from "./createChunks";
import { createObjectPool } from "./createObjectPool";
import { AssetType, GameObjectClasses } from "./constants";
import { createCulling } from "./createCulling";
import { AnimatedTilemap, TileAnimation } from "./tilemap";
import { createInput } from "./createInput";

export type GestureState<T extends keyof UserHandlers<EventTypes>> = Parameters<UserHandlers<EventTypes>[T]>[0];

export type Camera = {
  phaserCamera: Phaser.Cameras.Scene2D.Camera;
  worldView$: Observable<Phaser.Cameras.Scene2D.Camera["worldView"]>;
  zoom$: Observable<number>;
  ignore: (objectPool: ObjectPool, ignore: boolean) => void;
  dispose: () => void;
  centerCameraOnCoord: (tileCoord: Coord, tileWidth: number, tileHeight: number) => void;
};

export type GameObjectTypes = typeof GameObjectClasses;
export type GameObject<Type extends keyof GameObjectTypes> = InstanceType<GameObjectTypes[Type]>;

export type GameObjectFunction<Type extends keyof GameObjectTypes> = (
  gameObject: GameObject<Type>
) => Promise<void> | void;

export type GameScene = ReturnType<typeof defineScene>;

/**
 * @id: Unique id of the component to handle updating the same component
 * @now: Use for things like visual effects that are only relevant in this moment
 * @once: Use for setting parameters that should be set when initializing
 * @update: Use for adding update functions that are called at 60 FPS
 */
export type GameObjectComponent<Type extends keyof GameObjectTypes> = {
  id: string;
  now?: GameObjectFunction<Type>;
  once?: GameObjectFunction<Type>;
  update?: GameObjectFunction<Type>;
};

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Coord = {
  x: number;
  y: number;
};

export type PixelCoord = Coord;
export type ChunkCoord = Coord;
export type WorldCoord = Coord;

export type Chunks = ReturnType<typeof createChunks>;
export type ObjectPool = ReturnType<typeof createObjectPool>;
export type Culling = ReturnType<typeof createCulling>;
export type Input = ReturnType<typeof createInput>;

export type EmbodiedEntity<Type extends keyof GameObjectTypes> = {
  setComponent: (component: GameObjectComponent<Type>) => void;
  removeComponent: (id: string) => void;
  spawn: () => void;
  despawn: () => void;
  position: Coord;
  id: string;
  setCameraFilter: (filter: number) => void;
  type: Type;
};

export type Assets = {
  [key: string]: Asset;
};

export type TilesetConfig<A extends Assets> = {
  [key: string]: { assetKey: keyof A & string; tileWidth: number; tileHeight: number };
};

export type LayerConfig<A extends Assets, T extends TilesetConfig<A>> = {
  [key: string]: { tilesets: (keyof T & string)[]; hasHueTintShader?: boolean };
};

export type MapConfig<A extends Assets, T extends TilesetConfig<A>, L extends LayerConfig<A, T>> = {
  chunkSize: number;
  tileWidth: number;
  tileHeight: number;
  layers: { layers: L; defaultLayer: keyof L & string };
  backgroundTile: [number, ...number[]];
  animationInterval: number;
  tileAnimations?: { [key: string]: TileAnimation<number> };
};

type AnyMapConfig<A extends Assets, T extends TilesetConfig<A>> = MapConfig<A, T, LayerConfig<A, T>>;
type AnyTilesetConfig = TilesetConfig<Assets>;
type AnySceneConfig = SceneConfig<Assets, AnyTilesetConfig, MapsConfig<Assets, AnyTilesetConfig>, Animation<Assets>[]>;

export type MapsConfig<A extends Assets, T extends TilesetConfig<A>> = {
  [key: string]: AnyMapConfig<A, T>;
};

export type Animation<A extends Assets> = {
  key: string;
  assetKey: keyof A & string;
  startFrame: number;
  endFrame: number;
  frameRate: number;
  // Number of times to repeat the animation, -1 for infinity
  repeat: number;
  prefix?: string;
  suffix?: string;
};

export type SceneConfig<
  A extends Assets,
  T extends TilesetConfig<A>,
  M extends MapsConfig<A, T>,
  Ans extends Animation<A>[]
> = {
  preload?: (scene: Phaser.Scene) => void;
  create?: (scene: Phaser.Scene) => void;
  update?: (scene: Phaser.Scene) => void;
  assets: A;
  tilesets: T;
  maps: M;
  animations: Ans;
};

export type ScenesConfig = {
  [key: string]: AnySceneConfig;
};

type Scene<C extends AnySceneConfig> = {
  phaserScene: Phaser.Scene;
  objectPool: ObjectPool;
  camera: Camera;
  culling: Culling;
  maps: Maps<keyof C["maps"]>;
  input: Input;
};

export type Scenes<C extends ScenesConfig> = {
  [key in keyof C]: Scene<C[key]>;
};

export type Maps<Keys extends string | number | symbol> = {
  [key in Keys]: AnimatedTilemap<number, string, string>;
};

export type Tilesets<Keys extends string | number | symbol> = {
  [key in Keys]: Phaser.Tilemaps.Tileset;
};

export type Asset =
  | {
      type: AssetType.Image;
      key: string;
      path: string;
    }
  | {
      type: AssetType.SpriteSheet;
      key: string;
      path: string;
      options: {
        frameWidth: number;
        frameHeight: number;
      };
    }
  | {
      type: AssetType.MultiAtlas;
      key: string;
      path: string;
      options: {
        imagePath: string;
      };
    };

export type CameraConfig = {
  phaserSelector: string;
  pinchSpeed: number;
  wheelSpeed: number;
  minZoom: number;
  maxZoom: number;
};

export type PhaserEngineConfig<S extends ScenesConfig> = {
  sceneConfig: S;
  scale: Phaser.Types.Core.ScaleConfig;
  cameraConfig: CameraConfig;
  cullingChunkSize: number;
};
