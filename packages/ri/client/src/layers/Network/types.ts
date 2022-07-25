import { createNetworkLayer } from "./createNetworkLayer";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;
export type NetworkComponents = NetworkLayer["components"];

// Contract types
export enum ContractWorldEvent {
  ComponentValueSet = "ComponentValueSet",
  ComponentValueRemoved = "ComponentValueRemoved",
}

export enum UnitTypes {
  Donkey,
  Soldier,
}

export const UnitTypeNames: Record<number, string> = {
  [UnitTypes.Donkey]: "Donkey",
  [UnitTypes.Soldier]: "Soldier",
};

export enum StructureTypes {
  Settlement,
  GoldShrine,
  EscapePortal,
  Container,
}

export const StructureTypeNames: Record<number, string> = {
  [StructureTypes.Settlement]: "Settlement",
  [StructureTypes.GoldShrine]: "Gold Shrine",
  [StructureTypes.EscapePortal]: "Escape Portal",
  [StructureTypes.Container]: "Container",
};

export enum ItemTypes {
  Gold,
  EmberCrown,
}

export const ItemTypeNames: Record<number, string> = {
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
