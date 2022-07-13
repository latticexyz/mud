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
  Grass,
  Mountain,
  River,
  Wall,
  Settlement,
  Inventory,
  Gold,
  GoldShrine,
}
