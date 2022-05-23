import { ObservableMap } from "mobx";
import { PromiseValue } from "@latticexyz/utils";
import { createPhaserLayer } from "./createPhaserLayer";

export interface Scene {
  scene: Phaser.Scene;
  map: Phaser.Tilemaps.Tilemap;
}

export type SceneMaps = ObservableMap<number, Phaser.Tilemaps.Tilemap>;

export type PhaserLayer = PromiseValue<ReturnType<typeof createPhaserLayer>>;

export interface PixelCoord {
  x: number;
  y: number;
}
