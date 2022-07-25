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
  MainAtlas = "MainAtlas",
}

export enum Sprites {
  Settlement,
  Gold,
  Container,
  GoldShrine,
  EmberCrown,
  EscapePortal,
  Donkey,
  Soldier,
  Spear,
  Archer,
  Cavalry,
}

export enum Animations {}

export const UnitTypeSprites: Record<number, Sprites> = {
  [UnitTypes.Donkey]: Sprites.Donkey,
  [UnitTypes.Soldier]: Sprites.Soldier,
  [UnitTypes.Spear]: Sprites.Spear,
  [UnitTypes.Cavalry]: Sprites.Cavalry,
  [UnitTypes.Archer]: Sprites.Archer,
};

export const ItemTypeSprites: Record<number, Sprites> = {
  [ItemTypes.Gold]: Sprites.Gold,
  [ItemTypes.EmberCrown]: Sprites.EmberCrown,
};

export const StructureTypeSprites: Record<number, Sprites> = {
  [StructureTypes.Settlement]: Sprites.Settlement,
  [StructureTypes.GoldShrine]: Sprites.GoldShrine,
  [StructureTypes.EscapePortal]: Sprites.EscapePortal,
  [StructureTypes.Container]: Sprites.Container,
};
