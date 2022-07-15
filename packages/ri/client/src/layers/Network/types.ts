import { createNetworkLayer } from "./createNetworkLayer";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;
export type NetworkComponents = NetworkLayer["components"];

// Contract types
export enum ContractWorldEvent {
  ComponentValueSet = "ComponentValueSet",
  ComponentValueRemoved = "ComponentValueRemoved",
}

export enum UnitTypes {
  Hero,
  Donkey,
  Player,
}

export const UnitTypeNames: Record<number, string> = {
  [UnitTypes.Hero]: "Hero",
  [UnitTypes.Donkey]: "Donkey",
  [UnitTypes.Player]: "Player",
};

export enum StructureTypes {
  Settlement,
  GoldShrine,
  EscapePortal,
}

export const StructureTypeNames: Record<number, string> = {
  [StructureTypes.Settlement]: "Settlement",
  [StructureTypes.GoldShrine]: "Gold Shrine",
  [StructureTypes.EscapePortal]: "Escape Portal",
};

export enum ItemTypes {
  Inventory,
  Gold,
  EmberCrown,
}

export const ItemTypeNames: Record<number, string> = {
  [ItemTypes.Inventory]: "Inventory",
  [ItemTypes.Gold]: "Gold",
  [ItemTypes.EmberCrown]: "Ember Crown",
};

export enum TerrainTypes {
  Grass,
  Mountain,
  Water,
  Wall,
  Tree,
}

export const TerrainTypeNames: Record<number, string> = {
  [TerrainTypes.Grass]: "Grass",
  [TerrainTypes.Mountain]: "Mountain",
  [TerrainTypes.Water]: "Water",
  [TerrainTypes.Wall]: "Wall",
  [TerrainTypes.Tree]: "Tree",
};
