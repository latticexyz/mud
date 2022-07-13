import { createNetworkLayer } from "./createNetworkLayer";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;
export type NetworkComponents = NetworkLayer["components"];

// Contract types
export enum ContractWorldEvent {
  ComponentValueSet = "ComponentValueSet",
  ComponentValueRemoved = "ComponentValueRemoved",
}

export enum EntityTypes {
  Hero,
  Settlement,
  Inventory,
  Gold,
  GoldShrine,
  EmberCrown,
  EscapePortal,
}

export enum TerrainTypes {
  Grass,
  Mountain,
  Water,
  Wall,
  Tree,
}
