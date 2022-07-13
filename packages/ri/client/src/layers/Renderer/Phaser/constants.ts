import { EntityTypes } from "../../Network";

export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;

export enum Scenes {
  Main = "Main",
}

export enum Maps {
  Main = "Main",
  Pixel = "Pixel",
  Tactic = "Tactic",
  Strategic = "Strategic",
}

export enum Assets {
  OverworldTileset = "OverworldTileset",
  MountainTileset = "MountainTileset",
  MainAtlas = "MainAtlas",
}

export enum Sprites {
  Hero,
  Settlement,
  Gold,
  Inventory,
  GoldShrine,
}

export enum Animations {}

export const EntityTypeSprites: Record<number, Sprites> = {
  [EntityTypes.Hero]: Sprites.Hero,
  [EntityTypes.Gold]: Sprites.Gold,
  [EntityTypes.Inventory]: Sprites.Inventory,
  [EntityTypes.Settlement]: Sprites.Settlement,
  [EntityTypes.GoldShrine]: Sprites.GoldShrine,
};
