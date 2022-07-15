import { UnitTypes, ItemTypes, StructureTypes } from "../../Network";

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
  TreesTileset = "TreesTileset",
  MainAtlas = "MainAtlas",
}

export enum Sprites {
  Hero,
  Settlement,
  Gold,
  Inventory,
  GoldShrine,
  EmberCrown,
  EscapePortal,
  Donkey,
}

export enum Animations {
  EscapePortalAnimation = "EscapePortalAnimation",
}

export enum Layers {
  Background = "Background",
  Foreground = "Foreground",
  Trees = "Trees",
}

export enum Tilesets {
  Overworld = "Overworld",
  Trees = "Trees",
}

export const UnitTypeSprites: Record<number, Sprites> = {
  [UnitTypes.Hero]: Sprites.Hero,
  [UnitTypes.Donkey]: Sprites.Donkey,
};

export const UnitTypeAnimations: Record<number, Animations> = {};

export const ItemTypeSprites: Record<number, Sprites> = {
  [ItemTypes.Inventory]: Sprites.Inventory,
  [ItemTypes.Gold]: Sprites.Gold,
  [ItemTypes.EmberCrown]: Sprites.EmberCrown,
};

export const ItemTypeAnimations: Record<number, Animations> = {};

export const StructureTypeSprites: Record<number, Sprites> = {
  [StructureTypes.Settlement]: Sprites.Settlement,
  [StructureTypes.GoldShrine]: Sprites.GoldShrine,
  [StructureTypes.EscapePortal]: Sprites.EscapePortal,
};

export const StructureTypeAnimations: Record<number, Animations> = {
  [StructureTypes.EscapePortal]: Animations.EscapePortalAnimation,
};
